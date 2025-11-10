from django.db import models

class Localidad(models.Model):
    nombre = models.CharField(max_length=100, unique=True) #unique=True para que no se repitan nombres
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)


    def save(self, *args, **kwargs):
        self.nombre = self.nombre.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre
