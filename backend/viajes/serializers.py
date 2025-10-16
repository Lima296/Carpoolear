from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Viaje
<<<<<<< HEAD
        fields = '__all__'
=======
        fields = "__all__"
>>>>>>> main

