from django.contrib import admin
from django.urls import path
from .views import UsuarioViewSet, DetalleUsuario

urlpatterns = [
<<<<<<< Updated upstream
    path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
    path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
]
=======
     path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
     path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
     ]
>>>>>>> Stashed changes
