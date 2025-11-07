from rest_framework import serializers
from .models import Localidad

class LocalidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidad
        fields = ['id', 'nombre','lat','lon'] # Incluye el campo 'id' además de 'nombre'
        read_only_fields = ['id'] # El campo 'id' es de solo lectura