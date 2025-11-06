from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Reserva
# Actualizado para importar ambos serializadores
from .serializers import ReservaReadSerializer, ReservaWriteSerializer

class MisReservasView(generics.ListAPIView):
    serializer_class = ReservaReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Devuelve las reservas hechas por el usuario actual como pasajero
        return Reserva.objects.filter(usuario=self.request.user)

class ReservasPendientesView(generics.ListAPIView):
    # Esta vista es de solo lectura, usa el ReadSerializer
    serializer_class = ReservaReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Reserva.objects.filter(viaje__conductor=user, estado='PENDIENTE')

class ReservaLista(APIView):
    def get(self, request):
        reservas = Reserva.objects.all()
        # GET usa el ReadSerializer
        serializer = ReservaReadSerializer(reservas, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # POST usa el WriteSerializer
        serializer = ReservaWriteSerializer(data=request.data)
        if serializer.is_valid():
            reserva = serializer.save()
            # Devolvemos los datos con el ReadSerializer para tener todos los detalles
            read_serializer = ReservaReadSerializer(reserva)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ViajeReservasListView(generics.ListAPIView):
    serializer_class = ReservaReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        viaje_id = self.kwargs['viaje_id']
        return Reserva.objects.filter(viaje__id=viaje_id, estado='CONFIRMADA')


class ReservaDetalle(APIView):
    def get(self, request, uuid):
        reserva = get_object_or_404(Reserva, uuid=uuid)
        # GET usa el ReadSerializer
        serializer = ReservaReadSerializer(reserva)
        return Response(serializer.data)

    def put(self, request, uuid):
        reserva = get_object_or_404(Reserva, uuid=uuid)
        # PUT usa el WriteSerializer
        serializer = ReservaWriteSerializer(reserva, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, uuid):
        reserva = get_object_or_404(Reserva, uuid=uuid)
        # PATCH usa el WriteSerializer
        serializer = ReservaWriteSerializer(reserva, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, uuid):
        reserva = get_object_or_404(Reserva, uuid=uuid)
        reserva.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
