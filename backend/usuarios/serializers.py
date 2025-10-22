from rest_framework import serializers
from .models import Usuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Usuario
        # Excluir campos que no deben ser enviados al frontend o que son manejados por el sistema
        exclude = ('groups', 'user_permissions', 'is_superuser', 'is_staff', 'last_login')
        read_only_fields = ['id', 'token', 'creado', 'actualizado']

    def validate_correo(self, value):
        """
        Validar que el correo no esté duplicado, permitiendo al usuario actual
        mantener su propio correo durante una actualización.
        """
        if self.instance and self.instance.correo == value:
            return value
        if Usuario.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value

    def create(self, validated_data):
        """
        Crea un nuevo usuario utilizando el manager del modelo, que hashea la contraseña.
        """
        # Mapeamos explícitamente los datos validados a la firma de create_user
        return Usuario.objects.create_user(
            correo=validated_data['correo'],
            nombre=validated_data['nombre'],
            password=validated_data['password'],
            apellido=validated_data.get('apellido', ''),
            telefono=validated_data.get('telefono', '')
        )

    def update(self, instance, validated_data):
        """
        Actualiza un usuario, manejando la contraseña de forma segura.
        """
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class UsuarioTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadir datos personalizados al token
        token['nombre'] = user.nombre
        token['correo'] = user.correo
        return token

    def validate(self, attrs):
        # La validación del padre (super) se encarga de verificar el usuario y la contraseña
        data = super().validate(attrs)
        
        # Añadir datos extra del usuario a la respuesta del login
        data['usuario'] = {
            'id': self.user.id,
            'nombre': self.user.nombre,
            'correo': self.user.correo
        }
        return data