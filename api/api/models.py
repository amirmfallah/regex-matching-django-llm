from django.db import models

# Function to generate the file path for uploaded content
def content_file_name(instance, filename):
    return '/'.join(['content', filename])

# Model to store different versions of the dataframe files
class DataframeFileVersion(models.Model):
    dataframe = models.ForeignKey('DataframeModel', on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to=content_file_name)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dataframe.title} - Version {self.id}"

# Main model to store the dataframe information
class DataframeModel(models.Model):
    title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to=content_file_name)
    current_version = models.IntegerField(default=0)

    # Overriding the save method to handle versioning
    def save(self, *args, **kwargs):
        # Check if the file is being updated
        if self.pk is not None:
            orig = DataframeModel.objects.get(pk=self.pk)
            if orig.file != self.file:
                # Save the old file version
                DataframeFileVersion.objects.create(dataframe=self, file=orig.file)
                self.current_version += 1
        super(DataframeModel, self).save(*args, **kwargs)

    # Method to undo the last file change
    def undo(self):
        if self.versions.exists():
            last_version = self.versions.last()
            self.file = last_version.file
            self.current_version -= 1
            last_version.delete()
            self.save()
        else:
            raise ValueError("No previous versions to undo.")

    def __str__(self):
        return self.title
