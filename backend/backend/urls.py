"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

# API Views
from estado.views import EstadoLista, EstadoDetalle
from usuarios.views import UsuarioViewSet, DetalleUsuario, LoginView, PerfilUsuarioActual
from provincias.views import ProvinciaLista, ProvinciaDetalle
from vehiculos.views import VehiculoDetalle, VehiculoLista
from viajes.views import ViajeLista, ViajeDetalle, MisViajesLista
from localidad.views import LocalidadDetalle, LocalidadLista
from reservas.views import ReservaLista, ReservaDetalle, ReservasPendientesView, ViajeReservasListView, MisReservasView

urlpatterns = [
    # Root redirect to dashboard
    path('', RedirectView.as_view(url='/dashboard/', permanent=True)),

    # Frontend App URLs
    path('', include('web.urls', namespace='web')),

    # Admin
    path('admin/', admin.site.urls),

    # API URLs
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/perfil/', PerfilUsuarioActual.as_view(), name='perfil_usuario'),

    path('api/usuarios/', UsuarioViewSet.as_view(), name='usuarios-lista'),
    path('api/usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),

    path('api/provincias/', ProvinciaLista.as_view(), name='provincias-lista'),
    path('api/provincias/<int:pk>/', ProvinciaDetalle.as_view(), name='provincias-detalle'),

    path('api/viajes/', ViajeLista.as_view(), name='viaje-lista'),
    path('api/viajes/<int:pk>/', ViajeDetalle.as_view(), name='viaje-detalle'),
    path('api/viajes/<int:viaje_id>/reservas/', ViajeReservasListView.as_view(), name='viaje-reservas-lista'),
    path('api/mis-viajes/', MisViajesLista.as_view(), name='mis-viajes-lista'),

    path('api/estados/', EstadoLista.as_view(), name='estados-lista'),
    path('api/estados/<int:pk>/', EstadoDetalle.as_view(), name='estados-detalle'),

    path('api/', include('vehiculos.urls')),
    
    path('api/localidades/', LocalidadLista.as_view(), name='localidad-lista'),
    path('api/localidades/<int:pk>/', LocalidadDetalle.as_view(), name='localidad-detalle'),

    path('api/mis-reservas/', MisReservasView.as_view(), name='mis-reservas'),
    path('api/reservas/', ReservaLista.as_view(), name='reserva-lista'),
    path('api/reservas/pendientes/', ReservasPendientesView.as_view(), name='reservas-pendientes'),
    path('api/reservas/<uuid:uuid>/', ReservaDetalle.as_view(), name='reserva-detalle'),

    path('api/calificaciones/', include('calificaciones.urls')),
]