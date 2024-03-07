from django.db import models

def content_file_name(instance, filename):
    return '/'.join(['content', filename])

# Create your models here.
class DataframeModel(models.Model):
  title = models.CharField(max_length=100)
  created_at = models.DateTimeField(auto_now_add=True)
  dtypes = models.JSONField(default=dict, null=True)
  file = models.FileField(upload_to=content_file_name)

  def __str__(self):
    return self.title