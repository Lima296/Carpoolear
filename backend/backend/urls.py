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
# 🔑 CORRECCIÓN 1: Asegúrate de importar 'include'
from django.urls import path, include 
# Importaciones de tus vistas de API
from estado.views import EstadoViewSet
from usuarios.views import UsuarioViewSet, DetalleUsuario, LoginView
from provincias.views import PronviciasViewSet

# 🔑 CORRECCIÓN 2: Eliminamos 'from . import views' (causaba error) y no es necesario 
# si usamos 'include' para delegar las rutas de frontend.

urlpatterns = [
    # Rutas de administración y APIs (las que ya tenías)
    path('admin/', admin.site.urls),
    path('usuarios/', UsuarioViewSet.as_view(), name='usuarios'),
    path('usuarios/<int:pk>/', DetalleUsuario.as_view(), name='detalle_usuario'),
    path('provincias/', PronviciasViewSet.as_view(), name='provincias'),
    path('estado/', EstadoViewSet.as_view(), name='estado'),
    path('login/', LoginView.as_view(), name='login'),
    
    # ✅ SOLUCIÓN AL 404: Incluye las URLs de la aplicación 'usuarios' en la ruta raíz.
    # Ahora que 'include' está importado, esta línea funcionará y reconocerá /miperfil/
    path('', include('usuarios.urls')), 
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