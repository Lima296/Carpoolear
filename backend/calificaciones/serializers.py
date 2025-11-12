from rest_framework import serializers
from .models import Calificacion
from usuarios.models import Usuario

# Serializador simple para mostrar la información del calificador
class CalificadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido']

class CalificacionSerializer(serializers.ModelSerializer):
    # Anidar el serializador del calificador para mostrar nombre y apellido
    calificador = CalificadorSerializer(read_only=True)

    class Meta:
        model = Calificacion
        fields = ['id', 'tipo', 'comentario', 'fecha_creacion', 'calificador', 'calificado', 'viaje']
        read_only_fields = ['fecha_creacion']
