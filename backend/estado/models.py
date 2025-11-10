from django.db import models

class Estado(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        self.nombre = self.nombre.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

