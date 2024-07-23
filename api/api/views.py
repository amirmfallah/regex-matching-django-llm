from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
import json
import pandas as pd
from openai import OpenAI
from django.utils import timezone
import os
from .models import DataframeModel
from .serializers import DataframeSerializer

# Initialize the OpenAI API client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", default=""))

# Dataframe APIViews for Create and List operations
class DataframeListCreateView(generics.ListCreateAPIView):
    queryset = DataframeModel.objects.all()
    serializer_class = DataframeSerializer

# slice the dataset based on the pagination variables
def paginate_data(data, page, page_size):
    start = (page - 1) * page_size
    end = page * page_size
    return data[start:end]

# Dataframe APIViews for Retrieve, Update, and Delete operations
class DataframeRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = DataframeModel.objects.all()
    serializer_class = DataframeSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        file_path = instance.file.path
        serializer = DataframeSerializer(instance)
        try:
            # Get the page and page_size query parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))

            # Read the file based on the file extension
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
                df = pd.read_excel(file_path)
            else:
                return Response({"error": "Unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)      

            # Paginate the data and convert to JSON
            data_list = paginate_data(df, page, page_size)
            data_list = data_list.to_json(orient='records', date_format='iso')

            column_names = list(df.columns)

            total_items = len(df)
            total_pages = (total_items // page_size) + (1 if total_items % page_size > 0 else 0)
            pagination_info = {
                'total_items': total_items,
                'total_pages': total_pages,
                'current_page': page,
                'page_size': page_size,
                'data': data_list,
                'columns': column_names
            }

            response = {**serializer.data, **pagination_info}
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            raise ValidationError(detail=e)

class DataframeFindAndReplaceView(views.APIView):
    def post(self, request, pk, format=None):
        try:
            # Get the dataframe object and file path
            dataframe = DataframeModel.objects.get(pk=pk)
            file_path = dataframe.file.path
            input_string = request.data.get('input_string')

            # Read the prompt from request body
            if not input_string:
                return Response({"error": "No input string provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Read the file based on the file extension
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
                df = pd.read_excel(file_path)
            else:
                return Response({"error": "Unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)

            # Sample rows for context
            column_names = df.columns.tolist()
            sample_rows = df.sample(n=10, random_state=1).to_markdown()


            # Using OpenAI's ChatGPT to generate regex patterns for columns
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": """
                        You will receive an input string and a list of column names. 
                        Generate a regex pattern that matches the description in the input string for each column name.
                        Also, provide the replacement value specified in the input. \n
                        Only include columns that are affected. \n
                        Your response should only contain the JSON array.\n\n
                        Below are sample rows from the dataset: \n """ +
                        sample_rows + 
                        '{"result": [{"column": "column_name", "regex": "regex_pattern", "replacement": "replacement"}]} \n You MUST answer with a JSON object that matches the JSON schema above. '
                    },
                    {"role": "user", "content": f"Input string: {input_string}, Column names: {', '.join(column_names)}"}
                ],  
                response_format={ "type": "json_object" }
            )

            # Parsing the response from OpenAI to extract the JSON object
            response = response.choices[0].message.content.strip()
            json_output = json.loads(response)

            for item in json_output['result']:
                column = item['column']
                regex = item['regex']
                replacement = item['replacement']
                df[column] = df[column].str.replace(regex, replacement, regex=True)

            # Save the updated dataframe to a new file
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            new_file_path = f"{file_path.rsplit('.', 1)[0]}_{timestamp}.{file_path.rsplit('.', 1)[1]}"
            if file_path.endswith('.csv'):
                df.to_csv(new_file_path, index=False)
            elif file_path.endswith('.xls') or file_path.endswith('.xlsx'):
                df.to_excel(new_file_path, index=False)

            dataframe.file.name = new_file_path
            dataframe.save()

            return Response({
                "received_string": input_string,
                "dataframe_id": dataframe.id,
                "columns": column_names,
                "chatgpt_response": json_output,
                "updated_dataframe": df.to_dict(orient='records')
            }, status=status.HTTP_200_OK)

        except DataframeModel.DoesNotExist:
            return Response({"error": "Dataframe not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DataframeUndoView(views.APIView):
    def post(self, request, pk, format=None):
        try:
            dataframe = DataframeModel.objects.get(pk=pk)
            dataframe.undo()
            return Response({"message": "Undo successful", "dataframe_id": dataframe.id}, status=status.HTTP_200_OK)
        except DataframeModel.DoesNotExist:
            return Response({"error": "Dataframe not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
