from django.urls import path
from .views import ReservaLista, ReservaDetalle, ReservasPendientesView

urlpatterns = [
    path('reservas/', ReservaLista.as_view(), name='reserva-lista'),
    path('reservas/pendientes/', ReservasPendientesView.as_view(), name='reservas-pendientes'),
    path('reservas/<uuid:uuid>/', ReservaDetalle.as_view(), name='reserva-detalle'),
]
