from rest_framework import serializers
from .models import Staff
from apps.accounts.serializers import UserSerializer


class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff model."""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = Staff
        fields = [
            'id', 'staff_number', 'user', 'full_name', 'email',
            'department', 'department_display', 'phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'staff_number', 'created_at', 'updated_at']


class StaffCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new staff member."""
    
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Staff
        fields = [
            'email', 'password', 'first_name', 'last_name',
            'department', 'phone'
        ]
    
    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Extract user data
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        
        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='staff'
        )
        
        # Create staff profile
        staff = Staff.objects.create(user=user, **validated_data)
        return staff
