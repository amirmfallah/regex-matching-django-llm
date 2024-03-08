from rest_framework import serializers
from .models import DataframeModel
from .utils.dtypes import infer_and_convert_data_types
import pandas as pd


class DataframeSerializer(serializers.ModelSerializer):
  class Meta:
    model = DataframeModel
    fields = ["id", "title", "file", 'dtypes']

  def create(self, validated_data):
    df = pd.read_csv(validated_data['file'])
    validated_data['dtypes'] = infer_and_convert_data_types(df).dtypes.astype(str).to_dict()
    return super().create(validated_data)
