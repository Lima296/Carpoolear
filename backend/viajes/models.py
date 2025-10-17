from django.db import models
from usuarios.models import Usuario  # Importamos el modelo de usuario

class Viaje(models.Model):
    conductor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE, #on_delete=models.CASCADE para borrar viajes si se borra el usuario
        related_name='viajes_creados'
    )
    origen = models.CharField(max_length=100)
    destino = models.CharField(max_length=100)
    fecha = models.DateField()
    hora = models.TimeField()
    asientos_disponibles = models.PositiveIntegerField()
    precio = models.DecimalField(max_digits=8, decimal_places=2) #decimalfield para precios

    creado = models.DateTimeField(auto_now_add=True) #guarda automáticamente la fecha y hora en el que el viaje fue creado en la base de datos // #auto_now_add=True para que se guarde automáticamente al crear el registro
    actualizado = models.DateTimeField(auto_now=True) #se actualiza automáticamente cada vez que se guarda o modifica algo. Sirve para ver cuando fue la última vez que se cambió un registro // auto_now=True para que se actualice automáticamente al guardar el registro

    def __str__(self):
        return f"{self.origen} → {self.destino} ({self.fecha})"