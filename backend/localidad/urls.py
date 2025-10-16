from django.urls import path
from .views import LocalidadDetalle, LocalidadLista

urlpatterns = [
    path('localidades/', LocalidadLista.as_view(), name='localidad-lista'),
    path('localidades/<int:pk>/', LocalidadDetalle.as_view(), name='localidad-detalle'),
]
