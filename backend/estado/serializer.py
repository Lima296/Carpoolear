from rest_framework import serializers
from .models import Estado

# Convierte el modelo Estado a formato JSON para poder usarlo en la API
class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__'
        read_only_fields = ['id']