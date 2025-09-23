from rest_framework import serializers
from django.contrib.auth.models import make_password
from .models import Vehiculo

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = ['id', 'patente', 'marca', 'modelo', 'color']
        read_only_fields = ['id']