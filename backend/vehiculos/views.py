from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Vehiculo
from .serializers import VehiculoSerializer

class VehiculoLista(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vehiculos = Vehiculo.objects.filter(propietario=request.user)
        serializer = VehiculoSerializer(vehiculos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VehiculoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(propietario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VehiculoDetalle(APIView):
    def get(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        serializer = VehiculoSerializer(vehiculo)
        return Response(serializer.data)

    def put(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        serializer = VehiculoSerializer(vehiculo, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        vehiculo = get_object_or_404(Vehiculo, pk=pk)
        vehiculo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MisVehiculosLista(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vehiculos = Vehiculo.objects.filter(propietario=request.user)
        serializer = VehiculoSerializer(vehiculos, many=True)
        return Response(serializer.data)