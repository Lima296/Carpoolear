from django.shortcuts import render
from rest_framework.views import APIView #permite crear vistas manualmente
from rest_framework.response import Response #devuelve datos en JSON
from rest_framework import status #tiene los codigos HTTP
from django.shortcuts import get_object_or_404
from .serializers import UsuarioSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UsuarioTokenObtainPairSerializer
from .models import Usuario

class UsuarioViewSet(APIView):
    def get(self, request):
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class DetalleUsuario(APIView):
    def get(self, request, pk):
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    
    def put(self, request, pk):
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        usuario = get_object_or_404(Usuario, pk=pk)
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LoginView(TokenObtainPairView):
    serializer_class = UsuarioTokenObtainPairSerializer # Usamos nuestro serializer personalizado


