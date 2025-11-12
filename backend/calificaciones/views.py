from rest_framework import viewsets, permissions
from .models import Calificacion
from .serializers import CalificacionSerializer

class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionSerializer
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios autenticados pueden calificar

    def get_queryset(self):
        """
        Sobrescribe el método get_queryset para filtrar las calificaciones
        basado en el usuario calificado y optimiza la consulta para incluir
        los datos del calificador.
        """
        # Usamos select_related('calificador') para evitar el problema N+1
        # al acceder a los datos del usuario que hizo la calificación.
        queryset = Calificacion.objects.select_related('calificador').order_by('-fecha_creacion')
        
        calificado_id = self.request.query_params.get('calificado_id')
        
        if calificado_id is not None:
            queryset = queryset.filter(calificado_id=calificado_id)
            
        return queryset

    def perform_create(self, serializer):
        """
        Asigna automáticamente al usuario actual como el calificador.
        """
        serializer.save(calificador=self.request.user)