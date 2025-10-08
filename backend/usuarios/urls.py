from django.contrib import admin
from django.urls import path
from .views import UsuarioViewSet, DetalleUsuario

urlpatterns = [
    path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
    path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
]