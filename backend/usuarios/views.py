from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

# Importaciones de tu backend (Modelos, Serializers)
from .serializers import UsuarioTokenObtainPairSerializer
from .models import Usuario
from .serializers import UsuarioSerializer


# =================================================================
# VISTAS DEL BACKEND (API REST FRAMEWORK)
# Estas clases manejan las peticiones GET, POST, PUT, DELETE para los datos de la API.
# =================================================================

class UsuarioViewSet(APIView):
    """
    Maneja las operaciones de listar y crear nuevos usuarios (GET y POST a /usuarios/).
    """
    def get(self, request):
        """Lista todos los usuarios."""
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Crea un nuevo usuario."""
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    'mensaje': 'Usuario registrado exitosamente',
                    'usuario': serializer.data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': 'Error al crear el usuario',
                    'detalle': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'Datos de registro inválidos',
                'errores': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    def delete(self, request):
        """Elimina todos los usuarios (¡Usar con precaución!)."""
        Usuario.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class DetalleUsuario(APIView):
    """
    Maneja las operaciones detalladas sobre un usuario específico (GET, PUT, DELETE a /usuarios/<pk>/).
    """
    def get(self, request, pk):
        """Obtiene un usuario por su clave primaria (pk)."""
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Actualiza un usuario existente."""
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Elimina un usuario específico."""
        usuario = get_object_or_404(Usuario, pk=pk)
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PerfilUsuarioActual(APIView):
    """
    Maneja la obtención y actualización del perfil del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtiene los datos del perfil del usuario actual."""
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Actualiza los datos del perfil del usuario actual."""
        usuario = request.user
        
        # Clona los datos para poder modificarlos
        data = request.data.copy()
            
        serializer = UsuarioSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """
    Endpoint para obtener tokens JWT (Login). 
    Utiliza el serializer personalizado para la autenticación.
    """
    serializer_class = UsuarioTokenObtainPairSerializer