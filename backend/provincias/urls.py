<<<<<<< HEAD
from django.urls import path
from .views import ProvinciaDetalle, ProvinciaLista

urlpatterns = [
    path('', ProvinciaLista.as_view(), name='provincia-lista'),
    path('<int:pk>/', ProvinciaDetalle.as_view(), name='provincia-detalle'),
=======
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProvinciaViewSet

router = DefaultRouter()
router.register(r'provincias', ProvinciaViewSet)

urlpatterns = [
    path('', include(router.urls)),
>>>>>>> main
]