from rest_framework import serializers
from django.contrib.auth.models import make_password
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'correo', 'password_hash', 'token', 'creado', 'actualizado']
        read_only_fields = ['id', 'token', 'creado', 'actualizado']

        def create(self, validated_data): # Método para crear un usuario
            password = validated_data.pop('password') # Sacamos la contraseña en texto plano
            validated_data['password_hash'] = make_password(password)
             # La convertimos en hash y guardamos en password_hash
            return Usuario.objects.create(**validated_data) # Creamos el usuario en la DB
        
        def update(self, instance, validated_data): # Método para actualizar un usuario
            password = validated_data.pop('password', None)
            if password:
                instance.password_hash = make_password(password)
            # Si se envía nueva contraseña, la hasheamos
            for attr, value in validated_data.items(): # Actualizamos el resto de los campos
                setattr(instance, attr, value)
            instance.save()
            return instance
        
# class ProvinciaSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Provincia
#         fields = ['id', 'nombre']
#         read_only_fields = ['id']

#     def create(self, validated_data):
#         return Provincia.objects.create(**validated_data)
    
#     def update(self, instance, validated_data):
#         instance.nombre = validated_data.get('nombre', instance.nombre)
#         instance.save()
#         return instance

        
