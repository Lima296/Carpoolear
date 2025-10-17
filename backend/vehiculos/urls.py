from django.urls import path
from .views import VehiculoLista, VehiculoDetalle

urlpatterns = [
    path('vehiculos/', VehiculoLista.as_view(), name='vehiculo-lista'),
    path('vehiculos/<int:pk>/', VehiculoDetalle.as_view(), name='vehiculo-detalle'),
]
