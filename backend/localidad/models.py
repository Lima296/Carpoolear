from django.db import models

class Localidad(models.Model):
    nombre = models.CharField(max_length=100, unique=True) #unique=True para que no se repitan nombres

    def __str__(self):
        return self.nombre

