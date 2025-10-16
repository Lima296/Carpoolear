<<<<<<< HEAD
from django.urls import path
from .views import ViajeLista, ViajeDetalle

urlpatterns = [
    path('viajes/', ViajeLista.as_view(), name='viajes-lista'),
    path('viajes/<int:pk>/', ViajeDetalle.as_view(), name='viajes-detalle'),
]
=======
from rest_framework import routers
from .views import ViajeViewSet

router = routers.DefaultRouter()
router.register(r'viajes', ViajeViewSet)

urlpatterns = router.urls

>>>>>>> main
