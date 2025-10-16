from django.db import models
<<<<<<< HEAD
import secrets #genera tokens seguros

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True) #blank=true opcional
    dni = models.CharField(max_length=20, unique=True) #unique=true no se repite
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=128, blank=True)
    password_hash = models.CharField(max_length=128) #almacena el hash de la contraseña
    token = models.CharField(max_length=40, unique=True, editable=False)

    creado = models.DateTimeField(auto_now_add=True) #fecha de creacion, se llena automaticamente
    actualizado = models.DateTimeField(auto_now=True) #fecha de actualizacion, se actualiza automaticamente

    def save(self, *args, **kwargs): #*args para argumentos posicionales, **kwargs para argumentos con nombre
        if not self.token: #si no tiene token..
            self.token = secrets.token_hex(20) #genera un token de 40 caracteres hexadecimales
        super().save(*args, **kwargs) #llama al metodo save original

    def __str__(self):
        return f"{self.nombre} {self.apellido} , ({self.correo})" #como se muestra en el admin
=======
import secrets

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    # Guardamos la contraseña hasheada acá (nunca en texto plano)
    password_hash = models.CharField(max_length=128)
    # Token propio por usuario (lo generamos automáticamente)
    token = models.CharField(max_length=40, unique=True, editable=False)

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_hex(20) # 40 chars
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.correo})"
>>>>>>> main
    
# class Provincia(models.Model):
#     nombre = models.CharField(max_length=100)

#     def __str__(self):
#         return self.nombre  

