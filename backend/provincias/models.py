from django.db import models


class Provincia(models.Model):
    nombre = models.CharField(max_length=100, unique=True) #unique=True para que no se repitan nombres

    def save(self, *args, **kwargs):
        self.nombre = self.nombre.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre