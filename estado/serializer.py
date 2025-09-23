from rest_framework import serializers
from django.contrib.auth.models import make_password
from .models import Estado

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id', 'nombre']
        read_only_fields = ['id']