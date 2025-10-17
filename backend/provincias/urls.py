from django.urls import path
from .views import ProvinciaDetalle, ProvinciaLista

urlpatterns = [
    path('api/provincias/', ProvinciaLista.as_view(), name='provincias-lista'),
    path('api/provincias/<int:pk>/', ProvinciaDetalle.as_view(), name='provincias-detalle'),
]