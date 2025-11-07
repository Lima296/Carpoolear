from django.db import models
from usuarios.models import Usuario  # Importamos el modelo de usuario
from localidad.models import Localidad # Importamos el modelo de localidad

class Viaje(models.Model):
    conductor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE, #on_delete=models.CASCADE para borrar viajes si se borra el usuario
        related_name='viajes_creados'
    )
    origen = models.ForeignKey(Localidad, on_delete=models.PROTECT, related_name='viajes_origen')
    destino = models.ForeignKey(Localidad, on_delete=models.PROTECT, related_name='viajes_destino')
    fecha = models.DateField()
    hora = models.TimeField()
    asientos_disponibles = models.PositiveIntegerField()
    precio = models.DecimalField(max_digits=8, decimal_places=2) #decimalfield para precios
    detalle_viaje = models.CharField(max_length=200, blank=True, null=True)
    estado = models.CharField(max_length=10, choices=[('CREADO', 'Creado'), ('EN_CURSO', 'En Curso'), ('FINALIZADO', 'Finalizado')], default='CREADO')
    distancia = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tiempo = models.IntegerField(null=True, blank=True) # en minutos



    creado = models.DateTimeField(auto_now_add=True) #guarda automáticamente la fecha y hora en el que el viaje fue creado en la base de datos // #auto_now_add=True para que se guarde automáticamente al crear el registro
    actualizado = models.DateTimeField(auto_now=True) #se actualiza automáticamente cada vez que se guarda o modifica algo. Sirve para ver cuando fue la última vez que se cambió un registro // auto_now=True para que se actualice automáticamente al guardar el registro

    def __str__(self):
        return f"{self.origen} → {self.destino} ({self.fecha})"