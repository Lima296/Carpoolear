from rest_framework import serializers
from .models import Viaje
from localidad.serializers import LocalidadSerializer
from usuarios.serializers import UsuarioSerializer

class ViajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Viaje
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Para la lectura, reemplazamos el ID con la representación completa del objeto.
        representation['origen'] = LocalidadSerializer(instance.origen).data
        representation['destino'] = LocalidadSerializer(instance.destino).data
        representation['conductor'] = UsuarioSerializer(instance.conductor).data
        return representation

