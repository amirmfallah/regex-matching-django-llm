from django.shortcuts import render
from rest_framework import viewsets, status, generics
from .models import DataframeModel
from .serializers import DataframeSerializer
from .utils.dtypes import infer_and_convert_data_types, apply_types
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
import pandas as pd
import json

class DataframeListCreateView(generics.ListCreateAPIView):
  queryset = DataframeModel.objects.all()
  serializer_class = DataframeSerializer


def paginate_data(data, page, page_size):
    start = (page - 1) * page_size
    end = page * page_size
    return data[start:end]

class DataframeRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
  queryset = DataframeModel.objects.all()
  serializer_class = DataframeSerializer
  lookup_field = "pk"

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    file_path = instance.file.path
    serializer = DataframeSerializer(instance)
    try:
      # Get pagination parameters from the request
      page = int(request.query_params.get('page', 1))
      page_size = int(request.query_params.get('page_size', 10))

      # Read the CSV file using Pandas
      df = pd.read_csv(file_path)
      df = paginate_data(df, page, page_size)

      # Convert DataFrame to list of dicts and paginate
      parse_error = {"message": ""}
      try:
        data_list = apply_types(df, serializer.data['dtypes'])
        data_list = data_list.to_json(orient='records', date_format='iso')
        print(data_list)
      except Exception as e:
        data_list = df.to_json(orient='records')
        parse_error['message'] = e


      # Include pagination metadata in your response
      total_items = len(data_list)
      total_pages = (total_items // page_size) + (1 if total_items % page_size > 0 else 0)
      pagination_info = {
          'total_items': total_items,
          'total_pages': total_pages,
          'current_page': page,
          'page_size': page_size,
          'data': data_list
      }

      response = {**serializer.data, **pagination_info, **parse_error}
      # You might want to return the DataFrame as JSON in the response
      return Response(response, status=status.HTTP_200_OK)

    except Exception as e:
      # Handle file read error (file not found, not a CSV, etc.)
      raise ValidationError(detail='Cannot parse CSV file')

  def patch(self, request, *args, **kwargs):
    instance = self.get_object()
    file_path = instance.file.path
    serializer = DataframeSerializer(instance)

    # Parse request body as JSON
    body = dict()
    try:
      body = json.loads(request.body)
    except:
      raise ValidationError(detail='Cannot parse request body')


    try:
      # Read the CSV file using Pandas
      df = apply_types(pd.read_csv(file_path), serializer.data['dtypes'])
    except Exception as e:
      # Handle file read error (file not found, not a CSV, etc.)
      raise ValidationError(detail='Cannot open dataset')

    try:
      # Attempt parsing with the modified data type
      df.astype(body['dtypes'], errors='raise')
    except Exception as e:
      print(e)
      # Handle file parse error
      raise ValidationError(detail='Cannot parse modified columns')


    return super().patch(request, *args, **kwargs)