from django.urls import path
from .views import ProvinciaDetalle, ProvinciaLista

urlpatterns = [
    path('', ProvinciaLista.as_view(), name='provincia-lista'),
    path('<int:pk>/', ProvinciaDetalle.as_view(), name='provincia-detalle'),
]