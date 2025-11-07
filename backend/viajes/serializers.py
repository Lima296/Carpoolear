from rest_framework import serializers
from .models import Viaje
from usuarios.models import Usuario


class ConductorSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='nombre')
    last_name = serializers.CharField(source='apellido')

    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name']


class ViajeSerializer(serializers.ModelSerializer):
    conductor = ConductorSerializer(read_only=True)
    conductor_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), 
        source='conductor', 
        write_only=True
    )

    class Meta:
        model = Viaje
        fields = [
            'id',
            'origen',
            'destino',
            'fecha',
            'hora',
            'asientos_disponibles',
            'precio',
            'conductor',
            'conductor_id',
            'creado',
            'actualizado',
            'detalle_viaje'
        ]

