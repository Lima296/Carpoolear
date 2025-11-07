from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import secrets

class UsuarioManager(BaseUserManager):
    def create_user(self, correo, nombre, password=None, telefono=None, **extra_fields):
        if not correo:
            raise ValueError('El usuario debe tener un correo electrónico')
        
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, nombre=nombre, telefono=telefono, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, nombre, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(correo, nombre, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True)
    correo = models.EmailField(unique=True)
    telefono = models.CharField(max_length=128, blank=True)
    token = models.CharField(max_length=40, unique=True, editable=False, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombre']

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_hex(20)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} {self.apellido} , ({self.correo})"

    @property
    def reputacion(self):
        return 4.5

    @property
    def viajes_realizados(self):
        return 120