from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Estado
from .serializer import EstadoSerializer

class EstadoLista(APIView):
    def get(self, request):
        estados = Estado.objects.all()
        serializer = EstadoSerializer(estados, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EstadoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EstadoDetalle(APIView):
    def get(self, request, pk):
        estado = get_object_or_404(Estado, pk=pk)
        serializer = EstadoSerializer(estado)
        return Response(serializer.data)

    def put(self, request, pk):
        estado = get_object_or_404(Estado, pk=pk)
        serializer = EstadoSerializer(estado, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        estado = get_object_or_404(Estado, pk=pk)
        estado.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
