from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'facilities', views.StorageFacilityViewSet)
router.register(r'units', views.StorageUnitViewSet)

urlpatterns = [path('', include(router.urls))]
