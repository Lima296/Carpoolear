from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Viaje
from .serializers import ViajeSerializer

class ViajeLista(APIView):
    def get(self, request):
        origen = request.query_params.get('origen')
        destino = request.query_params.get('destino')
        fecha = request.query_params.get('fecha')

        viajes = Viaje.objects.all()

        if origen and origen.strip():
            viajes = viajes.filter(origen__icontains=origen)
        if destino and destino.strip():
            viajes = viajes.filter(destino__icontains=destino)
        if fecha and fecha.strip():
            viajes = viajes.filter(fecha=fecha)

        serializer = ViajeSerializer(viajes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ViajeSerializer(data=request.data)
        if serializer.is_valid(): #si los datos son válidos guarda el nuevo viaje en la BD
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED) #y devuelve el viaje creado
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #tira error si los datos no son válidos


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
