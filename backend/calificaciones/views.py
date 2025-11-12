from rest_framework import viewsets, permissions
from .models import Calificacion
from .serializers import CalificacionSerializer

class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer
    # permission_classes = [permissions.IsAuthenticated] # Dejamos esto comentado por ahora