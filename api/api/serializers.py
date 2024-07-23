from rest_framework import serializers
from .models import DataframeModel


class DataframeSerializer(serializers.ModelSerializer):
  class Meta:
    model = DataframeModel
    fields = ["id", "title", "file"]