from django.db import models
from usuarios.models import Usuario
from viajes.models import Viaje

class Calificacion(models.Model):
    class Tipo(models.TextChoices):
        LIKE = 'like', 'Like'
        DISLIKE = 'dislike', 'Dislike'

    calificador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones_emitidas')
    calificado = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones_recibidas')
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE, related_name='calificaciones')
    
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    comentario = models.TextField(blank=True, null=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Calificación de {self.calificador} a {self.calificado} para el viaje {self.viaje.id}'

    class Meta:
        unique_together = ('calificador', 'viaje') # Un usuario solo puede calificar una vez por viaje