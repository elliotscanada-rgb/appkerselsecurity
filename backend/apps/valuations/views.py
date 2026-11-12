from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Valuation, ServiceCharge
from .serializers import (
    ValuationSerializer, ValuationCreateUpdateSerializer,
    ServiceChargeSerializer, ServiceChargeCreateSerializer
)
from apps.accounts.permissions import IsAdmin, IsStaff, IsClient


class ValuationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing valuations.
    
    Admin: Full CRUD access
    Staff: Can create and view valuations for assigned consignments
    Client: Can view valuations for their consignments (read-only)
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['consignment', 'approval_status']
    search_fields = ['consignment__consignment_number', 'valuation_method']
    ordering_fields = ['valuation_date', 'created_at', 'assessed_value']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter valuations based on user role."""
        user = self.request.user
        base_queryset = Valuation.objects.select_related(
            'consignment', 'consignment__client', 'valued_by', 'approved_by'
        )
        
        if user.role == 'admin':
            return base_queryset
        elif user.role == 'staff':
            # Staff can see valuations for any consignment
            return base_queryset
        elif user.role == 'client':
            # Clients can only see valuations for their consignments
            return base_queryset.filter(consignment__client__user=user)
        
        return Valuation.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return ValuationCreateUpdateSerializer
        return ValuationSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            # Only admin and staff can create/update valuations
            self.permission_classes = [IsAuthenticated, IsStaff]
        elif self.action == 'destroy':
            # Only admin can delete
            self.permission_classes = [IsAuthenticated, IsAdmin]
        
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a valuation (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can approve valuations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        valuation = self.get_object()
        valuation.approval_status = 'approved'
        valuation.approved_by = request.user
        valuation.save()
        
        serializer = ValuationSerializer(valuation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a valuation (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can reject valuations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        valuation = self.get_object()
        valuation.approval_status = 'rejected'
        valuation.approved_by = request.user
        valuation.save()
        
        serializer = ValuationSerializer(valuation)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get pending valuations awaiting approval (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can view pending approvals.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending = self.get_queryset().filter(approval_status='pending')
        serializer = ValuationSerializer(pending, many=True)
        return Response(serializer.data)


class ServiceChargeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing service charges.
    
    Admin: Full CRUD access
    Staff: Can create and view charges (read-only for clients' consignments)
    Client: Can view only their charges (read-only)
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['consignment', 'charge_type']
    search_fields = ['consignment__consignment_number', 'charge_type']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter charges based on user role."""
        user = self.request.user
        base_queryset = ServiceCharge.objects.select_related(
            'consignment', 'consignment__client', 'charged_by'
        )
        
        if user.role == 'admin':
            return base_queryset
        elif user.role == 'staff':
            # Staff can see all charges
            return base_queryset
        elif user.role == 'client':
            # Clients can only see charges for their consignments
            return base_queryset.filter(consignment__client__user=user)
        
        return ServiceCharge.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return ServiceChargeCreateSerializer
        return ServiceChargeSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            # Only admin and staff can create/update charges
            self.permission_classes = [IsAuthenticated, IsStaff]
        elif self.action == 'destroy':
            # Only admin can delete
            self.permission_classes = [IsAuthenticated, IsAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def by_consignment(self, request):
        """Get charges for a specific consignment."""
        consignment_id = request.query_params.get('consignment_id')
        
        if not consignment_id:
            return Response(
                {'error': 'consignment_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        charges = self.get_queryset().filter(consignment_id=consignment_id)
        serializer = ServiceChargeSerializer(charges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def total_by_type(self, request):
        """Get total charges grouped by type."""
        charges = self.get_queryset()
        result = {}
        
        for charge_type, display_name in ServiceCharge.CHARGE_TYPE_CHOICES:
            total = sum([float(c.amount) for c in charges.filter(charge_type=charge_type)])
            result[charge_type] = {
                'name': display_name,
                'total': str(total)
            }
        
        return Response(result)
