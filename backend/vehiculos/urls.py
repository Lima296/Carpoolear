from django.urls import path
from .views import listado_vehiculos_api

urlpatterns = [
    path('api/listado/', listado_vehiculos_api, name='listado_vehiculos_api'),
]