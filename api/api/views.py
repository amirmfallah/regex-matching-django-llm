from django.shortcuts import render
from rest_framework import viewsets, status, generics
from .models import DataframeModel
from .serializers import DataframeSerializer
from rest_framework.response import Response


class DataframeListCreateView(generics.ListCreateAPIView):
  queryset = DataframeModel.objects.all()
  serializer_class = DataframeSerializer

  # def list(self, request):
  #   serializer = DataframeSerializer(self.get_queryset(), many=True)
  #   return Response(serializer.data)

  # def create(self, request, *args, **kwargs):
  #   serializer = self.get_serializer(data=request.data)
  #   serializer.is_valid(raise_exception=True)
  #   serializer.save()
  #   return Response(serializer.data, status=status.HTTP_201_CREATED)

  # def update(self, request, pk=None):
  #     pass

  # def partial_update(self, request, pk=None):
  #     pass

  # def destroy(self, request, pk=None):
  #     pass


class DataframeRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
  queryset = DataframeModel.objects.all()
  serializer_class = DataframeSerializer
  lookup_field = "pk"