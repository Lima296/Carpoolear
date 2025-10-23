from django.db import models
from usuarios.models import Usuario
from viajes.models import Viaje

class Reserva(models.Model):

    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE)
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    cantidad_asientos = models.PositiveIntegerField()
    estado = models.CharField(max_length=12, choices=ESTADOS, default='PENDIENTE')

    '''def save(self, *args, **kwargs):

        if not self.pk:

            if self.viaje.asientos_disponibles > 0:
                self.viaje.asientos_disponibles -= 1
                self.viaje.save()

            else:
                raise ValueError("No hay suficientes asientos disponibles para este viaje.")
        # Lógica personalizada antes de guardar la reserva
        super().save(*args, **kwargs)'''

    def __str__(self):
        return f"Reserva de {self.usuario} para {self.viaje} - Asientos: {self.cantidad_asientos}"
