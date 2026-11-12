from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ShipmentViewSet, basename='shipment')
router.register(r'locations', views.ShipmentLocationViewSet, basename='shipment-location')

urlpatterns = [path('', include(router.urls))]
