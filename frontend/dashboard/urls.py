from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_view, name='dashboard.html'),  
    path('viaje/editar/<int:viaje_id>/', views.viaje_editar_view, name='viaje_editar'),
    path('misviajes/', views.misviajes_view, name='misviajes'),
]