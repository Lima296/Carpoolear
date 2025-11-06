from django.urls import path
from .views import reporte_view

urlpatterns = [
    path('', reporte_view, name='reportes'),
]
