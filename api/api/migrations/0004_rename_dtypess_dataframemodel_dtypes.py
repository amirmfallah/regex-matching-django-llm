# Generated by Django 5.0.3 on 2024-03-06 23:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_dataframemodel_dtypess_dataframemodel_file_path'),
    ]

    operations = [
        migrations.RenameField(
            model_name='dataframemodel',
            old_name='dtypess',
            new_name='dtypes',
        ),
    ]
