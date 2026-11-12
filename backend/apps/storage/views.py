from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import StorageFacility, StorageUnit
from .serializers import StorageFacilitySerializer, StorageUnitSerializer

class StorageFacilityViewSet(viewsets.ModelViewSet):
    queryset = StorageFacility.objects.all()
    serializer_class = StorageFacilitySerializer
    permission_classes = [IsAuthenticated]

class StorageUnitViewSet(viewsets.ModelViewSet):
    queryset = StorageUnit.objects.all()
    serializer_class = StorageUnitSerializer
    permission_classes = [IsAuthenticated]
