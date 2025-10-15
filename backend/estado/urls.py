from django.urls import path, include
from rest_framework.routers import DefaultRouter #genera las rutas automaticamente
from .views import EstadoViewSet

router = DefaultRouter() #crea las rutas automaticamente(get, post, put, delete)
router.register(r'estados', EstadoViewSet) #'r' es para que no se interpreten caracteres especiales

urlpatterns = [
    path('', include(router.urls)),
]
