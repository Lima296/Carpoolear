<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD:provincias/urls.py
>>>>>>> 0368a8750a3b260f295241b7c161d90d8bb3728b
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main:backend/provincias/urls.py
>>>>>>> 0368a8750a3b260f295241b7c161d90d8bb3728b
]