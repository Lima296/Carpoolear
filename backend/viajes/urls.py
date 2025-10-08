from rest_framework import routers
from .views import ViajeViewSet

router = routers.DefaultRouter()
router.register(r'viajes', ViajeViewSet)

urlpatterns = router.urls

