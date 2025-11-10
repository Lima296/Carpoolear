from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Viaje
from .serializers import ViajeSerializer
from vehiculos.models import Vehiculo

class ViajeLista(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []

    def get(self, request):
        origen = request.query_params.get('origen')
        destino = request.query_params.get('destino')
        fecha = request.query_params.get('fecha')

        viajes = Viaje.objects.all()

        if origen and origen.strip():
            if origen.isdigit():
                viajes = viajes.filter(origen_id=origen)
            else:
                viajes = viajes.filter(origen__nombre__icontains=origen)

        if destino and destino.strip():
            if destino.isdigit():
                viajes = viajes.filter(destino_id=destino)
            else:
                viajes = viajes.filter(destino__nombre__icontains=destino)
        if fecha and fecha.strip():
            viajes = viajes.filter(fecha=fecha)

        serializer = ViajeSerializer(viajes, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not Vehiculo.objects.filter(propietario=request.user).exists():
            return Response({"detail": "No tiene un vehículo registrado para poder crear un viaje."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ViajeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(conductor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MisViajesLista(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        viajes = Viaje.objects.filter(conductor=self.request.user)
        serializer = ViajeSerializer(viajes, many=True)
        return Response(serializer.data)



class ViajeDetalle(APIView):
    def get(self, request, pk):
        viaje = get_object_or_404(Viaje, pk=pk)
        serializer = ViajeSerializer(viaje)
        return Response(serializer.data)

    def put(self, request, pk):
        viaje = get_object_or_404(Viaje, pk=pk)
        serializer = ViajeSerializer(viaje, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        viaje = get_object_or_404(Viaje, pk=pk)
        viaje.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
