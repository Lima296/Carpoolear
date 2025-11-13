from rest_framework import serializers
from .models import Reserva
from viajes.serializers import ViajeSerializer
from usuarios.serializers import UsuarioSerializer

# Serializer para LEER datos (incluye detalles anidados)
class ReservaReadSerializer(serializers.ModelSerializer):
    viaje = ViajeSerializer(read_only=True)
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Reserva
        fields = ['uuid', 'usuario', 'viaje', 'fecha_reserva', 'cantidad_asientos', 'estado']

# Serializer para ESCRIBIR datos (usa IDs para relaciones)
class ReservaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['viaje', 'cantidad_asientos', 'usuario', 'estado']

