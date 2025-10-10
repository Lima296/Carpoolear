
from django.contrib import admin
from django.urls import path, include
from usuarios import views 


urlpatterns = [
    path('admin/', admin.site.urls),
    

    # Rutas de Frontend (usando las vistas importadas de 'usuarios')
    path('inicio/', views.inicio_view, name='inicio'),
    path('miperfil/', views.perfil_view, name='miperfil'),
]
