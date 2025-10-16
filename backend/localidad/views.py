from django.shortcuts import render
from rest_framework.views import APIView # la clase base para crear las vistas REST manualmente
from rest_framework.response import Response #devuelve respuestas HTTP con datos en JSON
from rest_framework import status
from django.shortcuts import get_object_or_404 #busca un objeto o devuelve un error 404 si no se encuentra
from .models import Localidad
from .serializers import LocalidadSerializer

class LocalidadLista(APIView): #esta clase maneja toda la colección de localidades
    def get(self, request): #listar
        localidades = Localidad.objects.all() #trae todas las localidades desde la base de datos
        serializer = LocalidadSerializer(localidades, many=True) #serializa las localidades a formato JSON
        return Response(serializer.data) #devuelve las localidades serializadas en una respuesta HTTP
    
    def post(self, request): #crear
        serializer = LocalidadSerializer(data=request.data) #crea un serializador con los datos recibidos en la solicitud
        if serializer.is_valid(): #ejecuta la validación de los datos
            serializer.save() #guarda la nueva localidad en la base de datos
            return Response(serializer.data, status=status.HTTP_201_CREATED) #devuelve la localidad creada
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #devuelve un error si los datos no son válidos

class LocalidadDetalle(APIView): #esta clase maneja operaciones sobre una localidad específica
    
    def get(self, request, pk): #detallar
        localidad = get_object_or_404(Localidad, pk=pk) #busca la localidad por su ID o devuelve un error 404
        serializer = LocalidadSerializer(localidad) #serializa la localidad a formato JSON
        return Response(serializer.data) #devuelve la localidad serializada en una respuesta HTTP

    def put(self, request, pk): #actualizar
        localidad = get_object_or_404(Localidad, pk=pk)
        serializer = LocalidadSerializer(localidad, data=request.data) #crea un serializador con la localidad existente y los nuevos datos
        if serializer.is_valid():
            serializer.save() #guarda los cambios en la base de datos
            return Response(serializer.data) #responde con la localidad actualizada
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #responde con un error si los datos no son válidos 

    def delete(self, request, pk): #eliminar
        localidad = get_object_or_404(Localidad, pk=pk)
        localidad.delete() #borra el registro de la base de datos
        return Response(status=status.HTTP_204_NO_CONTENT)
