from rest_framework import serializers
from .models import Shipment, ShipmentLocation
from apps.consignments.serializers import ConsignmentListSerializer


class ShipmentLocationSerializer(serializers.ModelSerializer):
    """Serializer for shipment location tracking."""
    
    location_type_display = serializers.CharField(
        source='get_location_type_display', read_only=True
    )
    recorded_by_name = serializers.CharField(
        source='recorded_by.full_name', read_only=True, allow_null=True
    )
    
    class Meta:
        model = ShipmentLocation
        fields = [
            'id', 'shipment', 'location_type', 'location_type_display',
            'latitude', 'longitude', 'address', 'city', 'country',
            'recorded_at', 'recorded_by', 'recorded_by_name'
        ]
        read_only_fields = ['id', 'recorded_at']


class ShipmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for shipment with location history."""
    
    consignment_number = serializers.CharField(
        source='consignment.consignment_number', read_only=True
    )
    client_name = serializers.CharField(
        source='consignment.client.full_name', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    transport_mode_display = serializers.CharField(
        source='get_transport_mode_display', read_only=True
    )
    assigned_to_name = serializers.CharField(
        source='assigned_to.full_name', read_only=True, allow_null=True
    )
    location_history = ShipmentLocationSerializer(many=True, read_only=True)
    latest_location_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'shipment_number', 'consignment', 'consignment_number',
            'client_name', 'origin', 'destination', 'transport_mode',
            'transport_mode_display', 'container_number',
            'dispatch_date', 'expected_arrival_date', 'actual_arrival_date',
            'assigned_to', 'assigned_to_name', 'status', 'status_display',
            'current_location', 'notes', 'created_at', 'updated_at',
            'location_history', 'latest_location_data'
        ]
        read_only_fields = [
            'id', 'shipment_number', 'created_at', 'updated_at'
        ]
    
    def get_latest_location_data(self, obj):
        """Get coordinates for current location."""
        latest = obj.latest_location
        if latest:
            return {
                'latitude': float(latest.latitude),
                'longitude': float(latest.longitude),
                'address': latest.address,
                'city': latest.city,
                'country': latest.country,
                'recorded_at': latest.recorded_at.isoformat(),
            }
        return None


class ShipmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing shipments - includes map data."""
    
    consignment_number = serializers.CharField(
        source='consignment.consignment_number', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    transport_mode_display = serializers.CharField(
        source='get_transport_mode_display', read_only=True
    )
    # Consignment nested info for the tracking dashboard
    consignment = serializers.SerializerMethodField()
    # Map data
    origin_location = serializers.SerializerMethodField()
    current_location_data = serializers.SerializerMethodField()
    destination_location = serializers.SerializerMethodField()
    location_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'shipment_number', 'consignment', 'consignment_number',
            'origin', 'destination', 'transport_mode', 'transport_mode_display',
            'status', 'status_display', 'current_location',
            'dispatch_date', 'expected_arrival_date', 'actual_arrival_date',
            'container_number', 'notes', 'created_at', 'updated_at',
            'origin_location', 'current_location_data', 'destination_location',
            'location_history',
        ]

    def get_consignment(self, obj):
        try:
            c = obj.consignment
            request = self.context.get('request')
            image_url = None
            if c.image:
                if request:
                    image_url = request.build_absolute_uri(c.image.url)
                else:
                    image_url = f"http://localhost:8000{c.image.url}"
            return {
                'id': c.id,
                'consignment_number': c.consignment_number,
                'item_name': c.item_name,
                'client_name': c.client.full_name if c.client else None,
                'declared_value': float(c.declared_value or 0),
                'weight': float(c.weight or 0),
                'weight_unit': c.weight_unit,
                'image_url': image_url,
            }
        except Exception:
            return None

    def get_origin_location(self, obj):
        loc = obj.origin_location
        if loc:
            return {'lat': float(loc.latitude), 'lng': float(loc.longitude),
                    'address': loc.address, 'city': loc.city, 'country': loc.country}
        return None

    def get_current_location_data(self, obj):
        loc = obj.latest_location
        if loc:
            return {'lat': float(loc.latitude), 'lng': float(loc.longitude),
                    'address': loc.address, 'city': loc.city, 'country': loc.country,
                    'recorded_at': loc.recorded_at.isoformat()}
        return None

    def get_destination_location(self, obj):
        loc = obj.destination_location
        if loc:
            return {'lat': float(loc.latitude), 'lng': float(loc.longitude),
                    'address': loc.address, 'city': loc.city, 'country': loc.country}
        return None

    def get_location_history(self, obj):
        return [
            {
                'lat': float(loc.latitude),
                'lng': float(loc.longitude),
                'address': loc.address,
                'city': loc.city,
                'country': loc.country,
                'location_type': loc.location_type,
                'recorded_at': loc.recorded_at.isoformat(),
            }
            for loc in obj.location_history.all()[:20]  # limit to 20 entries
        ]


class ShipmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shipments."""
    
    class Meta:
        model = Shipment
        fields = [
            'consignment', 'origin', 'destination', 'transport_mode',
            'container_number', 'dispatch_date', 'expected_arrival_date',
            'assigned_to', 'status', 'current_location', 'notes'
        ]


class ShipmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating shipments - consignment is read-only."""
    
    class Meta:
        model = Shipment
        fields = [
            'origin', 'destination', 'transport_mode',
            'container_number', 'dispatch_date', 'expected_arrival_date',
            'assigned_to', 'status', 'current_location', 'notes'
        ]


class ShipmentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating shipments."""
    
    class Meta:
        model = Shipment
        fields = [
            'consignment', 'origin', 'destination', 'transport_mode',
            'container_number', 'dispatch_date', 'expected_arrival_date',
            'assigned_to', 'status', 'current_location', 'notes'
        ]


class ShipmentWithLocationsSerializer(serializers.ModelSerializer):
    """Serializer combining shipment with formatted location data."""
    
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    transport_mode_display = serializers.CharField(
        source='get_transport_mode_display', read_only=True
    )
    
    origin_location = serializers.SerializerMethodField()
    current_location_data = serializers.SerializerMethodField()
    destination_location = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'shipment_number', 'origin', 'destination',
            'transport_mode', 'transport_mode_display', 'status',
            'status_display', 'current_location', 'origin_location',
            'current_location_data', 'destination_location'
        ]
    
    def get_origin_location(self, obj):
        """Get origin location coordinates."""
        loc = obj.origin_location
        if loc:
            return {
                'lat': float(loc.latitude),
                'lng': float(loc.longitude),
                'address': loc.address,
            }
        return None
    
    def get_current_location_data(self, obj):
        """Get current location coordinates."""
        loc = obj.latest_location
        if loc:
            return {
                'lat': float(loc.latitude),
                'lng': float(loc.longitude),
                'address': loc.address,
            }
        return None
    
    def get_destination_location(self, obj):
        """Get destination location coordinates."""
        loc = obj.destination_location
        if loc:
            return {
                'lat': float(loc.latitude),
                'lng': float(loc.longitude),
                'address': loc.address,
            }
        return None
