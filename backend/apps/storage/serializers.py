from rest_framework import serializers
from .models import StorageFacility, StorageUnit

class StorageFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageFacility
        fields = '__all__'

class StorageUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageUnit
        fields = '__all__'
