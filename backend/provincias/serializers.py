from rest_framework import serializers
from django.contrib.auth.models import make_password
from .models import Provincia

class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = ['id', 'nombre']
        read_only_fields = ['id']