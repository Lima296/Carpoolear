
from django.contrib import admin
from django.urls import path, include
from usuarios import views 
from dashboard import views as dashboard_views


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de Frontend (usando las vistas importadas de 'usuarios')
    path('', views.inicio_view, name='root_inicio'),
    path('inicio/', views.inicio_view, name='inicio'),
    path('miperfil/', views.perfil_view, name='miperfil'),
    path('', include('dashboard.urls')),
    path('reportes/', include('reporte.urls')),
]
