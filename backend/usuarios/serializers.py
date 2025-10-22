from rest_framework import serializers
from .models import Usuario 
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken


class UsuarioSerializer(serializers.ModelSerializer):
    # Campo para recibir la contraseña en texto plano (solo escritura)
    password = serializers.CharField(write_only=True, required=True, min_length=8) 

    class Meta:
        model = Usuario
        # El cambio clave para el 400 Bad Request: especificamos solo los campos que vienen en el registro.
        fields = ['nombre', 'correo', 'password'] 
        # Campos de solo lectura.
        read_only_fields = ['id', 'token', 'creado', 'actualizado', 'password_hash'] 
    
    def validate_correo(self, value):
        """Validar que el correo no esté duplicado"""
        if Usuario.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado. Por favor, utiliza otro correo.")
        return value


    def create(self, validated_data): # Método para crear un usuario
        password = validated_data.pop('password') # Sacamos la contraseña en texto plano
        # La convertimos en hash y guardamos en password_hash
        validated_data['password_hash'] = make_password(password)
            
        try:
            return Usuario.objects.create(**validated_data)
        except Exception as e:
            # Para cualquier otro error inesperado durante la creación
            print(f"Error al crear usuario: {e}") 
            raise serializers.ValidationError({
                'non_field_errors': ['Error al crear el usuario. Inténtalo de nuevo.']
            })
    
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
