from django.contrib import admin
from django.urls import path
<<<<<<< HEAD
from views import UsuarioViewSet, DetalleUsuario
=======
from .views import UsuarioViewSet, DetalleUsuario
>>>>>>> main

urlpatterns = [
    path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
    path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
<<<<<<< HEAD
    ]
=======
]
>>>>>>> main
