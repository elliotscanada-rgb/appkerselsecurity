from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Client
from .serializers import ClientSerializer, ClientCreateSerializer
from apps.accounts.permissions import IsAdminUser


class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet for managing clients."""
    
    queryset = Client.objects.select_related('user').all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['client_number', 'user__email', 'user__first_name', 'user__last_name', 'phone']
    ordering_fields = ['created_at', 'client_number']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClientCreateSerializer
        return ClientSerializer
    
    def get_permissions(self):
        """Admin can do everything, clients can only view their own profile."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        if user.role == 'admin':
            return self.queryset
        elif user.role == 'client':
            return self.queryset.filter(user=user)
        return Client.objects.none()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's client profile."""
        try:
            client = Client.objects.get(user=request.user)
            serializer = self.get_serializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def consignments(self, request, pk=None):
        """Get all consignments for a specific client."""
        client = self.get_object()
        from apps.consignments.models import Consignment
        from apps.consignments.serializers import ConsignmentSerializer
        
        consignments = Consignment.objects.filter(client=client)
        serializer = ConsignmentSerializer(consignments, many=True)
        return Response(serializer.data)
