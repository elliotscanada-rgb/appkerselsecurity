from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'records', views.CustodyRecordViewSet, basename='custody-record')

urlpatterns = [path('', include(router.urls))]
