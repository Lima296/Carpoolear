from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Usuario
from .serializers import UsuarioSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Usuario
from vehiculos.models import Vehiculo

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

@csrf_exempt
def registrar_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        nombre = data.get('nombre')
        correo = data.get('correo')
        password_hash = data.get('password_hash')

        # Validaciones básicas
        if not nombre or not correo or not password_hash:
            return JsonResponse({'error': 'Faltan datos obligatorios'}, status=400)

        if Usuario.objects.filter(correo=correo).exists():
            return JsonResponse({'error': 'El correo ya está registrado'}, status=400)

        vehiculo_data = data.get('vehiculo')
        vehiculo = None
        if vehiculo_data:
            if Vehiculo.objects.filter(patente=vehiculo_data['patente']).exists():
                return JsonResponse({'error': 'La patente ya está registrada'}, status=400)
            # Validar que todos los campos obligatorios estén presentes
            campos_obligatorios = ['patente', 'marca', 'modelo', 'color', 'asientos']
            for campo in campos_obligatorios:
                if campo not in vehiculo_data:
                    return JsonResponse({'error': f'Falta el campo obligatorio: {campo}'}, status=400)
            vehiculo = Vehiculo.objects.create(
                patente=vehiculo_data['patente'],
                marca=vehiculo_data['marca'],
                modelo=vehiculo_data['modelo'],
                color=vehiculo_data['color'],
                asientos=vehiculo_data['asientos']
            )

        usuario = Usuario.objects.create(
            nombre=nombre,
            apellido=data.get('apellido', ''),
            correo=correo,
            password_hash=password_hash,
            patente_vehiculo=vehiculo
        )

        return JsonResponse({'mensaje': 'Usuario registrado correctamente', 'usuario_id': usuario.id, 'token': usuario.token})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)


