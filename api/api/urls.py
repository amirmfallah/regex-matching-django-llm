from django.urls import path
from . import views
urlpatterns = [
  path("dataframe/", views.DataframeListCreateView.as_view(), name='dataframe-view-create'),
  path("dataframe/<int:pk>/", views.DataframeRetrieveUpdateDestroy.as_view(), name='update')
]

