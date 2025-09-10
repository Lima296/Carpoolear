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
        return Response(status=status.HTTP_204_NO_CONTENT)