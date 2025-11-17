from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Viaje
from .serializers import ViajeSerializer
from vehiculos.models import Vehiculo
from localidad.models import Localidad

class ViajeLista(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []

    def get(self, request):
        origen_param = request.query_params.get('origen')
        destino_param = request.query_params.get('destino')
        fecha_param = request.query_params.get('fecha')

        filters = {}

        if origen_param and origen_param.strip():
            if origen_param.isdigit():
                filters['origen_id'] = origen_param
            else:
                origen_ids = Localidad.objects.filter(nombre__iexact=origen_param).values_list('id', flat=True)
                filters['origen_id__in'] = list(origen_ids)

        if destino_param and destino_param.strip():
            if destino_param.isdigit():
                filters['destino_id'] = destino_param
            else:
                destino_ids = Localidad.objects.filter(nombre__iexact=destino_param).values_list('id', flat=True)
                filters['destino_id__in'] = list(destino_ids)
        
        if fecha_param and fecha_param.strip():
            filters['fecha'] = fecha_param

        # Apply filters and order by the 'actualizado' field to show newest first
        viajes = Viaje.objects.select_related('origen', 'destino', 'conductor').filter(**filters).order_by('-actualizado')

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
        viajes = Viaje.objects.select_related('origen', 'destino', 'conductor').filter(conductor=self.request.user)
        serializer = ViajeSerializer(viajes, many=True)
        return Response(serializer.data)



class ViajeDetalle(APIView):
    def get(self, request, pk):
        viaje = get_object_or_404(Viaje.objects.select_related('origen', 'destino', 'conductor'), pk=pk)
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
