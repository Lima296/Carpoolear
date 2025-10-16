from django.db import models
<<<<<<< HEAD
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

=======
from usuarios.models import Usuario #relaciona viaje con conductor
from provincias.models import Provincia #relaciona viaje con provincia de origen y destino
from vehiculos.models import Vehiculo #vincular que auto usa el conductor
from estado.models import Estado #indica el estado del viaje

class Viaje(models.Model):
    origen = models.ForeignKey(Provincia, related_name='viajes_origen', on_delete=models.CASCADE) #related_name permite acceder a los viajes de una provincia con provincia.viajes_origen.all() // #on_delete=models.CASCADE indica que si se borra la provincia, se borran sus viajes
    destino = models.ForeignKey(Provincia, related_name='viajes_destino', on_delete=models.CASCADE) #igual que origen
    fecha_salida = models.DateTimeField() #almacena sólo fecha y hora
    fecha_llegada = models.DateTimeField() #almacena sólo fecha y hora
    conductor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='viajes') #on_delete=models.CASCADE indica que si se borra el usuario, se borran sus viajes // #related_name='viajes' permite acceder a los viajes de un usuario con usuario.viajes.all()
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.SET_NULL, null=True) #on_delete=models.SET_NULL indica que si se borra el vehiculo, el campo se pone en null
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE, default=1) #default=1 indica que si no se envía, Django usa el Estado con id=1 (si ede id no existe, o te tira error) // #on_delete=models.CASCADE indica que si se borra el estado, se borran sus viajes
    asientos_disponibles = models.IntegerField() #no acepta valores negativos // #SE PUEDE AGREGAR UNA VALIDACIÓN PARA QUE ORIGEN != DESTINO
    # precio = models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return f'Viajo de {self.origen} a {self.destino} el {self.fecha_salida}'
>>>>>>> main

