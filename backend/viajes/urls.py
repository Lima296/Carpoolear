from django.urls import path
from .views import ViajeLista, ViajeDetalle

urlpatterns = [
    path('viajes/', ViajeLista.as_view(), name='viajes-lista'),
    path('viajes/<int:pk>/', ViajeDetalle.as_view(), name='viajes-detalle'),
]
