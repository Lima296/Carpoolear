from django.db import models


class Provincia(models.Model):
<<<<<<< HEAD
    nombre = models.CharField(max_length=100, unique=True) #unique=True para que no se repitan nombres

    def __str__(self):
        return self.nombre
=======
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre  
>>>>>>> main
