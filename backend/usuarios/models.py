from django.db import models
import secrets

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True)
    correo = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    token = models.CharField(max_length=40, unique=True, editable=False)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    # Relación con Vehiculo (puede ser null si el usuario no tiene vehículo)
    patente_vehiculo = models.ForeignKey(
        'vehiculos.Vehiculo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_hex(20) # 40 chars
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.correo})"