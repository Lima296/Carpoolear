#el serializers sirve para convertir objetos de la base de datos en formatos como por ejemplo JSON

from rest_framework import serializers
from .models import Vehiculo

class VehiculoSerializer(serializers.ModelSerializer): #ModelSerializer es una clase de DRF que automatiza el proceso de serialización tomando los campos directamente desde el modelo. Sin el modelserializser, tendríamos que definir manualmente cada campo.
    class Meta: #La clase interna Meta se usa para configurar el serializador. Le decís a Django de qué modelo sacar los datos y qué campos incluir.
        model = Vehiculo #lo definimos para que use el modelo Vehiculo
        fields = '__all__'
        read_only_fields = ('propietario', 'creado', 'actualizado') #son los campos que no pueden ser modificados por el usuario, solo se leen. En este caso, las fechas de creación y actualización son gestionadas automáticamente por Django.

