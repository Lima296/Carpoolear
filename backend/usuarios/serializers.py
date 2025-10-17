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
    
    def validate_correo(self, value):
        """Validar que el correo no esté duplicado"""
        if Usuario.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado. Por favor, utiliza otro correo.")
        return value


    def create(self, validated_data): # Método para crear un usuario
        password = validated_data.pop('password') # Sacamos la contraseña en texto plano
        validated_data['password_hash'] = make_password(password)
            # La convertimos en hash y guardamos en password_hash
        try:
            return Usuario.objects.create(**validated_data)
        except Exception as e:
            # Detectar si es error de correo duplicado
            if 'correo' in str(e).lower() or 'unique' in str(e).lower():
                raise serializers.ValidationError({
                    'correo': ['Este correo electrónico ya está registrado. Por favor, utiliza otro correo.']
                })
            else:
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
