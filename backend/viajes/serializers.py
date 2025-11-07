from rest_framework import serializers
from .models import Viaje
from localidad.serializers import LocalidadSerializer
from usuarios.serializers import UsuarioSerializer
from datetime import date

class ViajeSerializer(serializers.ModelSerializer):
    conductor = UsuarioSerializer(read_only=True)
    estado = serializers.SerializerMethodField()

    class Meta:
        model = Viaje
        fields = ['id', 'conductor', 'origen', 'destino', 'fecha', 'hora', 'asientos_disponibles', 'precio', 'detalle_viaje', 'estado', 'distancia', 'tiempo', 'creado', 'actualizado']


    def get_estado(self, obj):
        hoy = date.today()
        if obj.fecha < hoy:
            return 'Finalizado'
        elif obj.fecha == hoy:
            return 'En Curso'
        else:
            return 'Creado'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Para la lectura, reemplazamos el ID con la representación completa del objeto.
        representation['origen'] = LocalidadSerializer(instance.origen).data
        representation['destino'] = LocalidadSerializer(instance.destino).data
        representation['conductor'] = UsuarioSerializer(instance.conductor).data
        return representation

