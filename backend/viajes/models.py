from django.db import models
from usuarios.models import Usuario  # Importamos el modelo de usuario
from localidad.models import Localidad # Importamos el modelo de localidad
import requests # Importamos la librería requests para hacer llamadas a la API

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

    def save(self, *args, **kwargs):
        print("--- Entrando al método save() del Viaje ---") # DEBUG
        
        # Verificar que el origen y el destino tengan coordenadas
        if self.origen and self.destino and self.origen.lon and self.origen.lat and self.destino.lon and self.destino.lat:
            print(f"Coordenadas encontradas: Origen=({self.origen.lat}, {self.origen.lon}), Destino=({self.destino.lon}, {self.destino.lat})") # DEBUG
            try:
                # Construir la URL para la API de OSRM
                url = f"http://router.project-osrm.org/route/v1/driving/{self.origen.lon},{self.origen.lat};{self.destino.lat},{self.destino.lon}?overview=false"
                print(f"URL de OSRM: {url}") # DEBUG
                
                response = requests.get(url)
                response.raise_for_status()
                
                data = response.json()
                
                if data['code'] == 'Ok' and data['routes']:
                    route = data['routes'][0]
                    self.distancia = route['distance'] / 1000
                    self.tiempo = route['duration'] / 60
                    print(f"Cálculo exitoso: Distancia={self.distancia} km, Tiempo={self.tiempo} min") # DEBUG
                else:
                    print(f"Respuesta de OSRM no fue 'Ok' o no contenía rutas. Código: {data.get('code')}") # DEBUG
                
            except requests.exceptions.RequestException as e:
                print(f"Error al conectar con OSRM: {e}")
                self.distancia = None
                self.tiempo = None
        else:
            print("No se encontraron coordenadas para origen y/o destino. Saltando cálculo.") # DEBUG

        super(Viaje, self).save(*args, **kwargs)
        print(f"--- Saliendo del método save(). Distancia final: {self.distancia}, Tiempo final: {self.tiempo} ---") # DEBUG

    def __str__(self):
        return f"{self.origen} → {self.destino} ({self.fecha})"