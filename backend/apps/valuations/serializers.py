from rest_framework import serializers
from .models import Valuation, ServiceCharge, ChargeRemovalReason


class ValuationSerializer(serializers.ModelSerializer):
    """Serializer for Valuation model."""
    
    consignment_number = serializers.CharField(source='consignment.consignment_number', read_only=True)
    valued_by_name = serializers.CharField(source='valued_by.full_name', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    valuation_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Valuation
        fields = [
            'id', 'consignment', 'consignment_number', 'assessed_value', 'currency',
            'valuation_method', 'valuation_date', 'valuation_date_formatted',
            'valued_by', 'valued_by_name', 'approved_by', 'approved_by_name',
            'approval_status', 'approval_status_display', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'valuation_date', 'created_at', 'updated_at']
    
    def get_valuation_date_formatted(self, obj):
        """Return formatted valuation date."""
        return obj.valuation_date.strftime('%Y-%m-%d') if obj.valuation_date else None


class ValuationCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating valuations (Staff only)."""
    
    class Meta:
        model = Valuation
        fields = [
            'consignment', 'assessed_value', 'currency',
            'valuation_method', 'valued_by', 'approval_status', 'notes'
        ]
    
    def validate_assessed_value(self, value):
        """Validate that assessed value is positive."""
        if value <= 0:
            raise serializers.ValidationError("Assessed value must be greater than 0.")
        return value


class ServiceChargeSerializer(serializers.ModelSerializer):
    """Serializer for ServiceCharge model."""
    
    consignment_number = serializers.CharField(source='consignment.consignment_number', read_only=True)
    charge_type_display = serializers.CharField(source='get_charge_type_display', read_only=True)
    charged_by_name = serializers.CharField(source='charged_by.full_name', read_only=True, allow_null=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCharge
        fields = [
            'id', 'consignment', 'consignment_number', 'charge_type', 'charge_type_display',
            'amount', 'currency', 'description', 'charged_by', 'charged_by_name', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_status(self, obj):
        """Return 'paid' if consignment is completed, otherwise 'pending'."""
        if obj.consignment.status == 'completed':
            return 'paid'
        return 'pending'


class ServiceChargeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating service charges."""
    
    class Meta:
        model = ServiceCharge
        fields = [
            'consignment', 'charge_type', 'amount', 'currency', 'description', 'charged_by'
        ]
    
    def validate_amount(self, value):
        """Validate that amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Charge amount must be greater than 0.")
        return value


class ChargeRemovalReasonSerializer(serializers.ModelSerializer):
    """Serializer for charge removal reasons."""
    
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    removed_by_name = serializers.CharField(source='removed_by.full_name', read_only=True, allow_null=True)
    charge_details = ServiceChargeSerializer(source='charge', read_only=True)
    
    class Meta:
        model = ChargeRemovalReason
        fields = [
            'id', 'charge', 'charge_details', 'reason', 'reason_display',
            'notes', 'removed_by', 'removed_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
