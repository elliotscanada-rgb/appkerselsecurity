from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from . import views

app_name = 'consignments'

router = DefaultRouter()
router.register(r'', views.ConsignmentViewSet, basename='consignment')
router.register(r'settings', views.GoldSettingsViewSet, basename='gold-settings')

# Nested router for custody steps
# This allows URLs like:
# POST /api/consignments/{id}/custody_steps/
# PATCH /api/consignments/{id}/custody_steps/{step_id}/
# DELETE /api/consignments/{id}/custody_steps/{step_id}/
nested_router = SimpleRouter()
nested_router.register(r'custody_steps', views.CustodyStepViewSet, basename='custody-step')

urlpatterns = [
    path('', include(router.urls)),
]

# Add nested routes manually for custody steps
# The pattern is: /api/consignments/<consignment_id>/custody_steps/<step_id>/
urlpatterns += [
    path('<int:consignment_pk>/custody_steps/', 
         views.CustodyStepViewSet.as_view({'post': 'create', 'get': 'list'}), 
         name='custody-step-list'),
    path('<int:consignment_pk>/custody_steps/<int:pk>/', 
         views.CustodyStepViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy', 'get': 'retrieve'}), 
         name='custody-step-detail'),
]
