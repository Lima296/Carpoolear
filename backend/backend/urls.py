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
from django.urls import include, path
from usuarios.views import UsuarioViewSet, DetalleUsuario, LoginView
from provincias.views import ProvinciaLista, ProvinciaDetalle
from vehiculos.views import VehiculoDetalle, VehiculoLista
from viajes.views import ViajeLista, ViajeDetalle
from estado.views import EstadoLista, EstadoDetalle
from localidad.views import LocalidadDetalle, LocalidadLista


urlpatterns = [
    path('admin/', admin.site.urls),
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