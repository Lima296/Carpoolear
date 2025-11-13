from rest_framework import serializers
from .models import Viaje
from localidad.models import Localidad
from localidad.serializers import LocalidadSerializer
from usuarios.serializers import UsuarioSerializer
from datetime import date

class LocalidadRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        return LocalidadSerializer(value).data

    def to_internal_value(self, data):
        if isinstance(data, int):
            return Localidad.objects.get(pk=data)
        if isinstance(data, str):
            # Try to find by ID first, in case the string is a number
            try:
                return Localidad.objects.get(pk=int(data))
            except (ValueError, Localidad.DoesNotExist):
                # If it's not a valid ID, treat it as a name
                localidad, _ = Localidad.objects.get_or_create(nombre=data)
                return localidad
        raise serializers.ValidationError("Tipo de dato no soportado para la localidad.")


class ViajeSerializer(serializers.ModelSerializer):
    origen = LocalidadRelatedField(queryset=Localidad.objects.all())
    destino = LocalidadRelatedField(queryset=Localidad.objects.all())
    conductor = UsuarioSerializer(read_only=True)
    estado = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Viaje
        fields = ['id', 'conductor', 'origen', 'destino', 'fecha', 'hora', 'asientos_disponibles', 'precio', 'detalle_viaje', 'estado', 'distancia', 'tiempo', 'creado', 'actualizado']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Con el LocalidadRelatedField, origen y destino ya están serializados.
        # Solo necesitamos asegurarnos de que el conductor también lo esté.
        representation['conductor'] = UsuarioSerializer(instance.conductor).data
        return representation

