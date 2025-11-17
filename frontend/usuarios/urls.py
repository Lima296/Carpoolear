from django.urls import path
from . import views

urlpatterns = [
    path('inicio/', views.inicio_view, name='inicio'),
    path('ayuda/', views.ayuda_view, name='ayuda'),
    ]