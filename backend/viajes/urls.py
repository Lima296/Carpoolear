from django.urls import path
from .views import ViajeLista, ViajeDetalle, MisViajesLista

urlpatterns = [
    path('api/viajes/', ViajeLista.as_view(), name='viajes-lista'),
    path('api/viajes/<int:pk>/', ViajeDetalle.as_view(), name='viajes-detalle'),
    path('api/misviajes/', MisViajesLista.as_view(), name='mis-viajes-lista'),
]
