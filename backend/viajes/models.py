from django.db import models
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

