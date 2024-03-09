from rest_framework import serializers
from .models import DataframeModel
from .utils.dtypes import infer_and_convert_data_types
from .utils.spreadsheets import open_file
import pandas as pd
import os


class DataframeSerializer(serializers.ModelSerializer):
  class Meta:
    model = DataframeModel
    fields = ["id", "title", "file", 'dtypes']

  def create(self, validated_data):
    file_path = validated_data['file'].name
    file_extension = os.path.splitext(file_path)[1].lower()

    # Read the file based on its extension
    if file_extension == '.csv':
        df = pd.read_csv(validated_data['file'])
    elif file_extension in ['.xls', '.xlsx']:
        df = pd.read_excel(validated_data['file'])
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

    validated_data['dtypes'] = infer_and_convert_data_types(df).dtypes.astype(str).to_dict()
    return super().create(validated_data)
