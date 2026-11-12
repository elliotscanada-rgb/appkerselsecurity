from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q

from .models import Consignment, ConsignmentHistory
from .serializers import (
    ConsignmentSerializer,
    ConsignmentDetailSerializer,
    ConsignmentCreateSerializer,
    ConsignmentUpdateSerializer,
    ConsignmentListSerializer,
    ClientConsignmentListSerializer,
    ConsignmentHistorySerializer
)
from apps.accounts.permissions import IsAdmin, IsStaff, IsClient


class ConsignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing consignments.
    
    Admin: Full CRUD access to all consignments
    Staff: Can view all, update status/location  
    Client: Can view only their own consignments (read-only)
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['consignment_number', 'item_name', 'client__user__email', 'client__client_number']
    ordering_fields = ['created_at', 'received_date', 'consignment_number']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on user role and permissions."""
        user = self.request.user
        base_queryset = Consignment.objects.select_related(
            'client', 'client__user', 'received_by', 'received_by__user'
        ).prefetch_related('history', 'shipments')
        
        if user.role == 'admin':
            # Admin sees all consignments
            return base_queryset
        elif user.role == 'staff':
            # Staff sees all consignments they can work with
            return base_queryset
        elif user.role == 'client':
            # Client sees only their own consignments
            return base_queryset.filter(client__user=user)
        
        return Consignment.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action and user role."""
        user = self.request.user
        action = getattr(self, 'action', 'list')  # Default to 'list' if action not set yet
        
        if action == 'list':
            if user.role == 'client':
                return ClientConsignmentListSerializer
            return ConsignmentListSerializer
        elif action == 'retrieve':
            return ConsignmentDetailSerializer
        elif action == 'create':
            return ConsignmentCreateSerializer
        elif action in ['update', 'partial_update']:
            return ConsignmentUpdateSerializer
        
        return ConsignmentSerializer
    
    def get_permissions(self):
        """Set permissions based on action and user role."""
        if self.action in ['create', 'destroy', 'update']:
            # Only admin can fully manage consignments
            self.permission_classes = [IsAuthenticated, IsAdmin]
        elif self.action in ['partial_update', 'update_status']:
            # Admin and staff can update status
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        """Create a new consignment (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can create consignments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Create error = {e}")
            print(f"DEBUG: Request data = {request.data}")
            raise
    
    def destroy(self, request, *args, **kwargs):
        """Delete a consignment (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can delete consignments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my_consignments(self, request):
        """Get consignments for the current user (for clients)."""
        # Debug logging
        print(f"DEBUG: User role = {request.user.role if hasattr(request.user, 'role') else 'NO ROLE ATTR'}")
        print(f"DEBUG: User authenticated = {request.user.is_authenticated}")
        print(f"DEBUG: User = {request.user}")
        
        if request.user.role != 'client':
            return Response(
                {'error': 'This endpoint is only for client users'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get consignments for the current client user
        try:
            client = request.user.client_profile
            queryset = Consignment.objects.filter(client=client).select_related(
                'client', 'client__user', 'received_by', 'received_by__user'
            ).prefetch_related('history', 'shipments')
            
            serializer = ClientConsignmentListSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        except AttributeError as e:
            # User doesn't have a client profile
            print(f"DEBUG: AttributeError = {e}")
            return Response(
                {'error': f'User does not have a client profile: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get consignment statistics based on user role."""
        user = request.user
        queryset = self.get_queryset()
        
        total = queryset.count()
        by_status = {}
        
        for status_code, status_name in Consignment.STATUS_CHOICES:
            count = queryset.filter(status=status_code).count()
            by_status[status_code] = {
                'name': status_name,
                'count': count
            }
        
        # Calculate total declared value
        total_value = sum([float(c.declared_value) for c in queryset]) if queryset else 0
        
        return Response({
            'total_consignments': total,
            'by_status': by_status,
            'total_declared_value': str(total_value)
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update consignment status and add history entry."""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'detail': 'Only admin and staff can update consignment status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        consignment = self.get_object()
        new_status = request.data.get('status')
        location = request.data.get('location', '')
        description = request.data.get('description', '')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = dict(Consignment.STATUS_CHOICES)
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid options: {list(valid_statuses.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = consignment.status
        consignment.status = new_status
        
        if location:
            consignment.current_location = location
        
        consignment.save()
        
        # Add history entry
        staff = request.user.staff_profile if hasattr(request.user, 'staff_profile') else None
        consignment.add_history_event(
            event_type='status_change',
            previous_status=old_status,
            new_status=new_status,
            description=description,
            performed_by=staff
        )
        
        serializer = ConsignmentDetailSerializer(consignment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_charge(self, request, pk=None):
        """Add a service charge to a consignment (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can add charges.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        consignment = self.get_object()
        
        # Import here to avoid circular imports
        from apps.valuations.models import ServiceCharge
        from apps.valuations.serializers import ServiceChargeSerializer
        
        charge_type = request.data.get('charge_type')
        amount = request.data.get('amount')
        description = request.data.get('description', '')
        
        if not charge_type or not amount:
            return Response(
                {'error': 'charge_type and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            charge = ServiceCharge.objects.create(
                consignment=consignment,
                charge_type=charge_type,
                amount=amount,
                description=description,
                charged_by=request.user.staff_profile if hasattr(request.user, 'staff_profile') else None
            )
            
            serializer = ServiceChargeSerializer(charge)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['put'])
    def update_charge(self, request, pk=None):
        """Update a service charge (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can update charges.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from apps.valuations.models import ServiceCharge
        from apps.valuations.serializers import ServiceChargeSerializer
        
        charge_id = request.data.get('charge_id')
        if not charge_id:
            return Response(
                {'error': 'charge_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            charge = ServiceCharge.objects.get(id=charge_id, consignment_id=pk)
            
            # Update fields if provided
            if 'amount' in request.data:
                charge.amount = request.data.get('amount')
            if 'description' in request.data:
                charge.description = request.data.get('description')
            if 'charge_type' in request.data:
                charge.charge_type = request.data.get('charge_type')
            
            charge.save()
            serializer = ServiceChargeSerializer(charge)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ServiceCharge.DoesNotExist:
            return Response(
                {'error': 'Charge not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete_charge(self, request, pk=None):
        """Delete a service charge with removal reason (Admin only)."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can delete charges.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from apps.valuations.models import ServiceCharge, ChargeRemovalReason
        
        charge_id = request.data.get('charge_id')
        reason = request.data.get('reason', 'cleared')  # paid, cleared, waived, error, other
        notes = request.data.get('notes', '')
        
        if not charge_id:
            return Response(
                {'error': 'charge_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            charge = ServiceCharge.objects.get(id=charge_id, consignment_id=pk)
            
            # Create removal record
            ChargeRemovalReason.objects.create(
                charge=charge,
                reason=reason,
                notes=notes,
                removed_by=request.user.staff_profile if hasattr(request.user, 'staff_profile') else None
            )
            
            charge.delete()
            
            return Response(
                {'message': f'Charge deleted with reason: {reason}', 'success': True},
                status=status.HTTP_200_OK
            )
        except ServiceCharge.DoesNotExist:
            return Response(
                {'error': 'Charge not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get complete history for a consignment."""
        consignment = self.get_object()
        history = consignment.history.all()
        serializer = ConsignmentHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tracking_info(self, request, pk=None):
        """Get tracking information for a consignment (including shipment data)."""
        consignment = self.get_object()
        serializer = ConsignmentDetailSerializer(consignment)
        return Response(serializer.data)
