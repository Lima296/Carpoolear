from rest_framework import serializers
from .models import Provincia

class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = ['id', 'nombre'] # Incluye el campo 'id' además de 'nombre'
        read_only_fields = ['id'] # El campo 'id' es de solo lectura