from django.urls import path, include
from .views import EstadoLista, EstadoDetalle


urlpatterns = [
    path('api/estados/', EstadoLista.as_view(), name='estados-lista'),
    path('api/estados/<int:pk>/', EstadoDetalle.as_view(), name='estados-detalle'),
]
