from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Viaje
        fields = "__all__"

