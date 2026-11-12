from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CustodyRecord
from .serializers import CustodyRecordSerializer

class CustodyRecordViewSet(viewsets.ModelViewSet):
    queryset = CustodyRecord.objects.all()
    serializer_class = CustodyRecordSerializer
    permission_classes = [IsAuthenticated]
