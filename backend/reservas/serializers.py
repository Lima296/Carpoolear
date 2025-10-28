from rest_framework import serializers
from .models import Reserva

# Serializer para LEER datos (incluye detalles anidados)
class ReservaReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'
        depth = 2

# Serializer para ESCRIBIR datos (usa IDs para relaciones)
class ReservaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['viaje', 'cantidad_asientos', 'usuario', 'estado']

