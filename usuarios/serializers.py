from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True) # Campo para recibir la contraseña en texto plano y que no se vea

    class Meta:
        model = Usuario
        fields = '__all__' # Todos los campos del modelo
        read_only_fields = ['id', 'token', 'creado', 'actualizado','password_hash'] # Campos que no se pueden modificar directamente

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
        
class UsuarioTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "correo"

    def validate(self, attrs):
        correo = attrs.get("correo")
        password = attrs.get("password")

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
                raise serializers.ValidationError("Correo o contraseña incorrectos")
        if not check_password(password, usuario.password_hash): 
            raise serializers.ValidationError("Correo o contraseña incorrectos")
        
        refresh = RefreshToken.for_user(usuario)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "correo": usuario.correo
            }
        }
