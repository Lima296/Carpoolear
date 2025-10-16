<<<<<<< HEAD
from django.http import Http404
from django.shortcuts import render
from rest_framework.views import APIView # la clase base para crear las vistas REST manualmente
from rest_framework.response import Response #devuelve respuestas HTTP con datos en JSON
from rest_framework import status
from django.shortcuts import get_object_or_404 #busca un objeto o devuelve un error 404 si no se encuentra
from .models import Provincia
from .serializers import ProvinciaSerializer

class ProvinciaLista(APIView): #esta clase maneja toda la colección de provincias
    def get(self, request): #listar
        provincias = Provincia.objects.all() #trae todas las provincias desde la base de datos
        serializer = ProvinciaSerializer(provincias, many=True) #serializa las provincias a formato JSON
        return Response(serializer.data) #devuelve las provincias serializadas en una respuesta HTTP
    
    def post(self, request): #crear
        serializer = ProvinciaSerializer(data=request.data) #crea un serializador con los datos recibidos en la solicitud
        if serializer.is_valid(): #ejecuta la validación de los datos
            serializer.save() #guarda la nueva provincia en la base de datos
            return Response(serializer.data, status=status.HTTP_201_CREATED) #devuelve la provincia creada
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #devuelve un error si los datos no son válidos

class ProvinciaDetalle(APIView): #esta clase maneja operaciones sobre una provincia específica
    
    def get(self, request, pk): #detallar
        provincia = get_object_or_404(Provincia, pk=pk) #busca la provincia por su ID o devuelve un error 404
        serializer = ProvinciaSerializer(provincia) #serializa la provincia a formato JSON
        return Response(serializer.data) #devuelve la provincia serializada en una respuesta HTTP

    def put(self, request, pk): #actualizar
        provincia = get_object_or_404(Provincia, pk=pk)
        serializer = ProvinciaSerializer(provincia, data=request.data) #crea un serializador con la provincia existente y los nuevos datos
        if serializer.is_valid():
            serializer.save() #guarda los cambios en la base de datos
            return Response(serializer.data) #responde con la provincia actualizada
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) #responde con un error si los datos no son válidos 

    def delete(self, request, pk): #eliminar
        provincia = get_object_or_404(Provincia, pk=pk)
        provincia.delete() #borra el registro de la base de datos
=======
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Provincia
from .serializers import ProvinciaSerializer

class PronviciasViewSet(APIView):
    def get(self, request):
        provincias = Provincia.objects.all()
        serializer = ProvinciaSerializer(provincias, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = ProvinciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request):
        Provincia.objects.all().delete()
>>>>>>> main
        return Response(status=status.HTTP_204_NO_CONTENT)