"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
<<<<<<< HEAD
from django.urls import include, path
=======
# 🔑 CORRECCIÓN 1: Asegúrate de importar 'include'
from django.urls import path, include 
# Importaciones de tus vistas de API
from estado.views import EstadoViewSet
>>>>>>> main
from usuarios.views import UsuarioViewSet, DetalleUsuario, LoginView
from provincias.views import ProvinciaLista, ProvinciaDetalle
from vehiculos.views import VehiculoDetalle, VehiculoLista
from viajes.views import ViajeLista, ViajeDetalle
from estado.views import EstadoLista, EstadoDetalle
from localidad.views import LocalidadDetalle, LocalidadLista

# 🔑 CORRECCIÓN 2: Eliminamos 'from . import views' (causaba error) y no es necesario 
# si usamos 'include' para delegar las rutas de frontend.

urlpatterns = [
    # Rutas de administración y APIs (las que ya tenías)
    path('admin/', admin.site.urls),
<<<<<<< HEAD
    path('api/login/', LoginView.as_view(), name='login'),

    path('api/usuarios/', UsuarioViewSet.as_view(), name='usuarios-lista'),
    path('api/usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),

    path('api/provincias/', ProvinciaLista.as_view(), name='provincias-lista'),
    path('api/provincias/<int:pk>/', ProvinciaDetalle.as_view(), name='provincias-detalle'),

    path('api/viajes/', ViajeLista.as_view(), name='viaje-lista'),
    path('api/viajes/<int:pk>/', ViajeDetalle.as_view(), name='viaje-detalle'),

    path('api/estados/', EstadoLista.as_view(), name='estados-lista'),
    path('api/estados/<int:pk>/', EstadoDetalle.as_view(), name='estados-detalle'),

    path('api/vehiculos/', VehiculoLista.as_view(), name='vehiculo-lista'),
    path('api/vehiculos/<int:pk>/', VehiculoDetalle.as_view(), name='vehiculo-detalle'),
    
    path('api/localidad/', LocalidadLista.as_view(), name='localidad-lista'),
    path('api/localidad/<int:pk>/', LocalidadDetalle.as_view(), name='localidad-detalle'),
=======
    path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
    path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
    path('provincias/', PronviciasViewSet.as_view(), name='provincias'),
    path('estado/', EstadoViewSet.as_view(), name='estado'),
    path('login/', LoginView.as_view(), name='login'),
    
    # ✅ SOLUCIÓN AL 404: Incluye las URLs de la aplicación 'usuarios' en la ruta raíz.
    # Ahora que 'include' está importado, esta línea funcionará y reconocerá /miperfil/
    path('', include('usuarios.urls')), 
>>>>>>> main
]

"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""