import uuid
from django.db import models
from usuarios.models import Usuario
from viajes.models import Viaje

class Reserva(models.Model):

    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE)
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    cantidad_asientos = models.PositiveIntegerField()
    estado = models.CharField(max_length=12, choices=ESTADOS, default='PENDIENTE')

    def save(self, *args, **kwargs):
        # Si la reserva es nueva, no hacemos nada especial todavía.
        if not self.pk:
            super().save(*args, **kwargs)
            return

        # Obtenemos el estado original de la reserva desde la BD
        original = Reserva.objects.get(pk=self.pk)

        # Comprobamos si el estado ha cambiado de PENDIENTE a CONFIRMADA
        if original.estado == 'PENDIENTE' and self.estado == 'CONFIRMADA':
            viaje = self.viaje
            if viaje.asientos_disponibles >= self.cantidad_asientos:
                viaje.asientos_disponibles -= self.cantidad_asientos
                viaje.save()
            else:
                # Si no hay asientos, no se puede confirmar la reserva.
                # Lanzamos un error para que la operación falle.
                raise ValueError("No hay suficientes asientos disponibles para confirmar esta reserva.")
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva de {self.usuario} para {self.viaje} - Asientos: {self.cantidad_asientos}"

    def delete(self, *args, **kwargs):
        # Si la reserva estaba confirmada, devolvemos los asientos al viaje
        if self.estado == 'CONFIRMADA':
            viaje = self.viaje
            viaje.asientos_disponibles += self.cantidad_asientos
            viaje.save()
        
        super().delete(*args, **kwargs) # Llama al método de borrado original
