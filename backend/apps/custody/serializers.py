from rest_framework import serializers
from .models import CustodyRecord

class CustodyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustodyRecord
        fields = '__all__'
