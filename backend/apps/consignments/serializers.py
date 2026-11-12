from rest_framework import serializers
from rest_framework import serializers
from django.utils import timezone
from django.db import models
from .models import Consignment, ConsignmentHistory
from apps.clients.serializers import ClientSerializer


class ConsignmentHistorySerializer(serializers.ModelSerializer):
    """Serializer for ConsignmentHistory model."""
    
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True, allow_null=True)
    performed_by_email = serializers.CharField(source='performed_by.email', read_only=True, allow_null=True)
    timestamp_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = ConsignmentHistory
        fields = [
            'id', 'event_type', 'event_type_display', 'previous_status',
            'new_status', 'description', 'performed_by', 'performed_by_name',
            'performed_by_email', 'timestamp', 'timestamp_formatted'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_timestamp_formatted(self, obj):
        """Return formatted timestamp with date and time."""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')


class ConsignmentDetailSerializer(serializers.ModelSerializer):
    """Full serializer for Consignment model with all relationships."""
    
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_number = serializers.CharField(source='client.client_number', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    weight_unit_display = serializers.CharField(source='get_weight_unit_display', read_only=True)
    received_by_name = serializers.CharField(source='received_by.full_name', read_only=True, allow_null=True)
    image_url = serializers.SerializerMethodField()
    
    # Nested relationships
    history = ConsignmentHistorySerializer(many=True, read_only=True)
    shipments = serializers.SerializerMethodField()
    service_charges = serializers.SerializerMethodField()
    
    class Meta:
        model = Consignment
        fields = [
            'id', 'consignment_number', 'client', 'client_name', 'client_email', 'client_number',
            'item_name', 'category', 'category_display', 'description',
            'quantity', 'weight', 'weight_unit', 'weight_unit_display', 'purity',
            'declared_value', 'declared_value_currency',
            'status', 'status_display', 'current_location',
            'received_by', 'received_by_name', 'received_date',
            'image', 'image_url',
            'created_at', 'updated_at', 'history',
            'shipments', 'service_charges'
        ]
        read_only_fields = ['id', 'consignment_number', 'created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        """Get full image URL."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_shipments(self, obj):
        """Get shipments for this consignment."""
        try:
            from apps.shipments.serializers import ShipmentWithLocationsSerializer
            shipments = obj.shipments.all()
            return ShipmentWithLocationsSerializer(shipments, many=True).data
        except Exception as e:
            return []
    
    def get_service_charges(self, obj):
        """Get service charges for this consignment."""
        try:
            from apps.valuations.serializers import ServiceChargeSerializer
            charges = obj.service_charges.all()
            return ServiceChargeSerializer(charges, many=True).data
        except Exception as e:
            return []


class ConsignmentSerializer(serializers.ModelSerializer):
    """Standard serializer for Consignment model."""
    
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_number = serializers.CharField(source='client.client_number', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    weight_unit_display = serializers.CharField(source='get_weight_unit_display', read_only=True)
    received_by_name = serializers.CharField(source='received_by.full_name', read_only=True, allow_null=True)
    history = ConsignmentHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Consignment
        fields = [
            'id', 'consignment_number', 'client', 'client_name', 'client_email', 'client_number',
            'item_name', 'category', 'category_display', 'description',
            'quantity', 'weight', 'weight_unit', 'weight_unit_display', 'purity',
            'declared_value', 'declared_value_currency',
            'status', 'status_display', 'current_location',
            'received_by', 'received_by_name', 'received_date',
            'created_at', 'updated_at', 'history'
        ]
        read_only_fields = ['id', 'consignment_number', 'created_at', 'updated_at']


class ConsignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consignments (Admin/Staff only)."""
    
    class Meta:
        model = Consignment
        fields = [
            'client', 'item_name', 'category', 'description',
            'quantity', 'weight', 'weight_unit', 'purity',
            'declared_value', 'declared_value_currency',
            'current_location', 'received_date', 'status', 'image'
        ]
        read_only_fields = ['consignment_number']
    
    def create(self, validated_data):
        """Set received_date to now if not provided."""
        if 'received_date' not in validated_data or not validated_data['received_date']:
            validated_data['received_date'] = timezone.now()
        return super().create(validated_data)
    
    def validate(self, data):
        """Validate consignment data."""
        if data.get('quantity', 0) < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        
        if data.get('declared_value', 0) <= 0:
            raise serializers.ValidationError("Declared value must be greater than 0.")
        
        return data


class ConsignmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating consignment status and details."""
    
    class Meta:
        model = Consignment
        fields = [
            'status', 'current_location', 'item_name', 'category',
            'description', 'quantity', 'weight', 'weight_unit', 'purity',
            'declared_value', 'declared_value_currency', 'image'
        ]


class ConsignmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing consignments."""
    
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Consignment
        fields = [
            'id', 'consignment_number', 'client_name',
            'item_name', 'category_display', 'declared_value',
            'declared_value_currency', 'status', 'status_display',
            'current_location', 'received_date', 'image', 'image_url'
        ]
    
    def get_image_url(self, obj):
        """Get full image URL."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ClientConsignmentListSerializer(serializers.ModelSerializer):
    """Serializer for clients viewing their consignments with tracking info."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    total_value = serializers.DecimalField(
        source='declared_value', max_digits=15, decimal_places=2, read_only=True
    )
    shipment_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    total_charges = serializers.SerializerMethodField()
    service_charges = serializers.SerializerMethodField()
    
    class Meta:
        model = Consignment
        fields = [
            'id', 'consignment_number', 'item_name', 'category', 'category_display',
            'description', 'quantity', 'weight', 'weight_unit', 'purity',
            'declared_value', 'declared_value_currency', 'total_value', 
            'status', 'status_display', 'received_date', 'current_location', 
            'shipment_count', 'image', 'image_url',
            'total_charges', 'service_charges'
        ]
    
    def get_shipment_count(self, obj):
        """Get number of active shipments."""
        try:
            return obj.shipments.filter(
                status__in=['preparing', 'dispatched', 'in_transit', 'arrived']
            ).count()
        except:
            return 0
    
    def get_image_url(self, obj):
        """Get full image URL."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_total_charges(self, obj):
        """Get total charges for this consignment."""
        try:
            total = obj.service_charges.aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            return float(total)
        except:
            return 0
    
    def get_service_charges(self, obj):
        """Get service charges for this consignment."""
        try:
            from apps.valuations.serializers import ServiceChargeSerializer
            charges = obj.service_charges.all()
            return ServiceChargeSerializer(charges, many=True).data
        except:
            return []
            return 0
