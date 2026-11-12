from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Shipment, ShipmentLocation
from .serializers import (
    ShipmentDetailSerializer, ShipmentListSerializer, 
    ShipmentCreateSerializer, ShipmentUpdateSerializer,
    ShipmentLocationSerializer,
    ShipmentWithLocationsSerializer
)
from apps.accounts.permissions import IsAdmin, IsStaff, IsClient


class ShipmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shipments with location tracking.
    
    Admin: Can create, update, delete all shipments
    Staff: Can view and update shipments assigned to them
    Client: Can view only their own shipments (read-only)
    """
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create shipment and notify the client."""
        response = super().create(request, *args, **kwargs)
        
        # Send notification to client
        if response.status_code == status.HTTP_201_CREATED:
            try:
                from apps.notifications.models import Notification
                shipment = Shipment.objects.get(id=response.data['id'])
                client_user = shipment.consignment.client.user
                
                Notification.objects.create(
                    user=client_user,
                    title='Shipment Started',
                    message=f'Your shipment for {shipment.consignment.consignment_number} has been arranged and will be dispatched soon. Track your shipment in real-time.',
                    type='shipment'
                )
            except Exception as e:
                print(f"Error creating notification: {e}")
        
        return response
    
    def get_queryset(self):
        """Filter shipments based on user role."""
        user = self.request.user
        
        base_queryset = Shipment.objects.select_related(
            'consignment', 'consignment__client', 'consignment__client__user', 'assigned_to'
        ).prefetch_related('location_history')
        
        if user.role == 'admin':
            # Admin sees all shipments
            return base_queryset
        elif user.role == 'staff':
            # Staff sees shipments assigned to them
            return base_queryset.filter(
                Q(assigned_to__user=user) |
                Q(consignment__received_by__user=user)
            ).distinct()
        elif user.role == 'client':
            # Client sees only their own shipments
            return base_queryset.filter(
                consignment__client__user=user
            )
        
        return Shipment.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        action = getattr(self, 'action', 'list')  # Default to 'list' if action not set yet
        if action == 'list':
            return ShipmentListSerializer
        elif action == 'create':
            return ShipmentCreateSerializer
        elif action in ['update', 'partial_update']:
            return ShipmentUpdateSerializer
        else:
            return ShipmentDetailSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'destroy', 'update']:
            self.permission_classes = [IsAuthenticated, IsAdmin]
        elif self.action in ['partial_update']:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def tracking_data(self, request, pk=None):
        """Get shipment tracking data with locations formatted for client."""
        shipment = self.get_object()
        serializer = ShipmentWithLocationsSerializer(shipment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def location_history(self, request, pk=None):
        """Get complete location history for a shipment."""
        shipment = self.get_object()
        locations = shipment.location_history.all()
        serializer = ShipmentLocationSerializer(locations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='update-location', url_name='update-location')
    def update_location(self, request, pk=None):
        """Record a new location update for the shipment."""
        if request.user.role != 'staff' and request.user.role != 'admin':
            return Response(
                {'detail': 'Only staff can update locations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            shipment = self.get_object()
        except:
            return Response(
                {'detail': 'Shipment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate required fields
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        address = request.data.get('address', '').strip()
        
        if not address:
            return Response(
                {'detail': 'Address is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if lat is None or lng is None:
            return Response(
                {'detail': 'Latitude and longitude are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new location entry
        try:
            from decimal import Decimal, InvalidOperation
            
            # Convert to Decimal for database
            try:
                latitude = Decimal(str(lat))
                longitude = Decimal(str(lng))
            except (ValueError, TypeError, InvalidOperation) as e:
                return Response(
                    {'detail': f'Invalid coordinates: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get staff instance - but don't fail if not found
            staff_instance = None
            try:
                if hasattr(request.user, 'staff_profile'):
                    staff_instance = request.user.staff_profile
            except Exception as e:
                print(f"Note: Could not get staff_profile: {e}")
            
            # Create location
            location = ShipmentLocation(
                shipment=shipment,
                location_type=request.data.get('location_type', 'current') or 'current',
                latitude=latitude,
                longitude=longitude,
                address=address,
                city=request.data.get('city', '').strip() or '',
                country=request.data.get('country', '').strip() or '',
                recorded_by=staff_instance
            )
            location.full_clean()  # Validate before saving
            location.save()
            
            # Update shipment's current location
            shipment.current_location = address
            shipment.save()
            
            serializer = ShipmentLocationSerializer(location)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback.print_exc()
            return Response(
                {'detail': error_msg, 'error_type': type(e).__name__},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update shipment status."""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'detail': 'You do not have permission to update shipment status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        shipment = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Shipment.STATUS_CHOICES):
            return Response(
                {'detail': f'Invalid status: {new_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shipment.status = new_status
        shipment.save()
        
        serializer = ShipmentDetailSerializer(shipment)
        return Response(serializer.data)


class ShipmentLocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shipment location records.
    
    Admin/Staff: Can create and view location records
    Client: Can view only locations for their shipments (read-only)
    """
    queryset = ShipmentLocation.objects.all()
    serializer_class = ShipmentLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter locations based on user role."""
        user = self.request.user
        
        if user.role == 'admin':
            return ShipmentLocation.objects.all()
        elif user.role == 'staff':
            # Staff sees locations for shipments they handle
            return ShipmentLocation.objects.filter(
                Q(shipment__assigned_to__user=user) |
                Q(recorded_by__user=user)
            ).distinct()
        elif user.role == 'client':
            # Client sees only locations for their shipments
            return ShipmentLocation.objects.filter(
                shipment__consignment__client__user=user
            )
        
        return ShipmentLocation.objects.none()
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'destroy', 'update']:
            self.permission_classes = [IsAuthenticated, IsAdmin]
        
        return super().get_permissions()
