from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'valuations'

router = DefaultRouter()
router.register(r'', views.ValuationViewSet, basename='valuation')

charges_router = DefaultRouter()
charges_router.register(r'', views.ServiceChargeViewSet, basename='service-charge')

urlpatterns = [
    path('', include(router.urls)),
    path('charges/', include(charges_router.urls)),
]
