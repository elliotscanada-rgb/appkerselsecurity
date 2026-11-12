from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'consignments'

router = DefaultRouter()
router.register(r'', views.ConsignmentViewSet, basename='consignment')

urlpatterns = [
    path('', include(router.urls)),
]
