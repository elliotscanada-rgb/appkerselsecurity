from rest_framework import serializers
from .models import CustodyRecord


class CustodyRecordSerializer(serializers.ModelSerializer):
    """Serializer for reading custody records with full details."""

    previous_custodian_name = serializers.SerializerMethodField()
    new_custodian_name = serializers.SerializerMethodField()
    consignment_number = serializers.CharField(
        source='consignment.consignment_number', read_only=True
    )
    consignment_item_name = serializers.CharField(
        source='consignment.item_name', read_only=True
    )

    class Meta:
        model = CustodyRecord
        fields = [
            'id',
            'consignment', 'consignment_number', 'consignment_item_name',
            'previous_custodian', 'previous_custodian_name',
            'new_custodian', 'new_custodian_name',
            'previous_location', 'new_location',
            'transfer_date', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'transfer_date', 'created_at']

    def get_previous_custodian_name(self, obj):
        if obj.previous_custodian:
            return obj.previous_custodian.full_name
        return None

    def get_new_custodian_name(self, obj):
        if obj.new_custodian:
            return obj.new_custodian.full_name
        return None


class CustodyTransferSerializer(serializers.Serializer):
    """Serializer for recording a new custody transfer."""

    consignment_id = serializers.IntegerField()
    new_custodian_id = serializers.IntegerField()
    new_location = serializers.CharField(max_length=200)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_consignment_id(self, value):
        from apps.consignments.models import Consignment
        if not Consignment.objects.filter(id=value).exists():
            raise serializers.ValidationError('Consignment not found.')
        return value

    def validate_new_custodian_id(self, value):
        from apps.staff.models import Staff
        if not Staff.objects.filter(id=value).exists():
            raise serializers.ValidationError('Staff/Custodian not found.')
        return value

    def validate_new_location(self, value):
        if not value.strip():
            raise serializers.ValidationError('Location is required.')
        return value.strip()
