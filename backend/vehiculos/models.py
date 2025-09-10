from django.db import models
from usuarios.models import Usuario  # Importa el modelo Usuario

class Vehiculo(models.Model):
    patente = models.CharField(max_length=20, primary_key=True)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    asientos = models.IntegerField()
    propietario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='vehiculos')  # <-- Nuevo campo

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.patente})"