from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Reserva
from .serializers import ReservaSerializer

class ReservaLista(APIView):
    def get(self, request):
        reservas = Reserva.objects.all()
        serializer = ReservaSerializer(reservas, many=True)
        return Response(serializer.data)

    '''def post(self, request):
        serializer = ReservaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)'''
    
    def post(self, request):
        serializer = ReservaSerializer(data=request.data)
        if serializer.is_valid():
            reserva = serializer.save()
            viaje = reserva.viaje

            if viaje.asientos_disponibles >= reserva.cantidad_asientos:
                viaje.asientos_disponibles -= reserva.cantidad_asientos
                viaje.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                reserva.delete()
                return Response(
                    {"error": "No hay suficientes asientos disponibles para este viaje."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservaDetalle(APIView):
    def get(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data)

    def put(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        serializer = ReservaSerializer(reserva, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        reserva.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
