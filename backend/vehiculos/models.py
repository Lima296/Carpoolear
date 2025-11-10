from django.db import models
from usuarios.models import Usuario

class Vehiculo(models.Model):
    propietario = models.ForeignKey( #relacion de muchos a uno con Usuario
        Usuario,
        on_delete=models.CASCADE, #on_delete=models.CASCADE para borrar vehículos si se borra el usuario
        related_name='vehiculos' #define como acceder a los vehículos desde el usuario
    )
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    patente = models.CharField(max_length=10, unique=True)
    color = models.CharField(max_length=30)
    año = models.PositiveIntegerField(default=2000) #models.PositiveIntegerField para valores positivos
    asientos = models.PositiveIntegerField(default=4) 

    creado = models.DateTimeField(auto_now_add=True) #fecha de creación
    actualizado = models.DateTimeField(auto_now=True) #fecha de última actualización

    def save(self, *args, **kwargs):
        self.marca = self.marca.capitalize()
        self.modelo = self.modelo.capitalize()
        self.color = self.color.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.patente})"