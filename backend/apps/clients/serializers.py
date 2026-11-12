from rest_framework import serializers
from .models import Client
from apps.accounts.serializers import UserSerializer


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model."""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'client_number', 'user', 'full_name', 'email',
            'phone', 'address', 'city', 'country',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client_number', 'created_at', 'updated_at']


class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new client."""
    
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Client
        fields = [
            'email', 'password', 'first_name', 'last_name',
            'phone', 'address', 'city', 'country'
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
            role='client'
        )
        
        # Create client profile
        client = Client.objects.create(user=user, **validated_data)
        return client
