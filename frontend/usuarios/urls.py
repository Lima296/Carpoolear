from django.urls import path
from . import views

urlpatterns = [
    path('inicio/', views.inicio_view, name='inicio'),  
    ]