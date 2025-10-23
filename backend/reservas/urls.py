from django.urls import path
from .views import ReservaLista, ReservaDetalle

urlpatterns = [
    path('reservas/', ReservaLista.as_view(), name='reserva-lista'),
    path('reservas/<int:pk>/', ReservaDetalle.as_view(), name='reserva-detalle'),
]
