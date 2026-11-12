#!/usr/bin/env python
"""
Direct ORM test for CRUD operations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client
from apps.consignments.models import Consignment

User = get_user_model()

print("=" * 60)
print("TESTING CONSIGNMENT CRUD OPERATIONS (DIRECT ORM)")
print("=" * 60)

# Get test data
admin_user = User.objects.get(email='admin@test.com')
client_user = User.objects.get(email='client@test.com')
client = Client.objects.get(user=client_user)

# Test 1: Create
print("\n1. Testing CREATE...")
try:
    consignment = Consignment.objects.create(
        client=client,
        item_name='Test Platinum Bars',
        category='precious_metals',
        description='Test consignment for CRUD verification',
        quantity=3,
        weight=50.00,
        weight_unit='g',
        purity=95.0,
        declared_value=75000.00,
        declared_value_currency='USD',
        status='pending',
        current_location='Vault A',
    )
    print(f"✓ Created consignment")
    print(f"  ID: {consignment.id}")
    print(f"  Number: {consignment.consignment_number}")
    print(f"  Item: {consignment.item_name}")
    consignment_id = consignment.id
except Exception as e:
    print(f"✗ Create failed: {e}")
    exit(1)

# Test 2: Read
print("\n2. Testing READ...")
try:
    retrieved = Consignment.objects.get(id=consignment_id)
    print(f"✓ Retrieved consignment")
    print(f"  Item: {retrieved.item_name}")
    print(f"  Status: {retrieved.status}")
    print(f"  Client: {retrieved.client.full_name}")
except Exception as e:
    print(f"✗ Read failed: {e}")

# Test 3: Update
print("\n3. Testing UPDATE...")
try:
    consignment.status = 'received'
    consignment.current_location = 'Vault B'
    consignment.save()
    
    # Verify update
    updated = Consignment.objects.get(id=consignment_id)
    print(f"✓ Updated consignment")
    print(f"  New Status: {updated.status}")
    print(f"  New Location: {updated.current_location}")
except Exception as e:
    print(f"✗ Update failed: {e}")

# Test 4: Delete
print("\n4. Testing DELETE...")
try:
    Consignment.objects.get(id=consignment_id).delete()
    print(f"✓ Deleted consignment")
    
    # Verify deletion
    try:
        Consignment.objects.get(id=consignment_id)
        print(f"✗ ERROR: Consignment still exists!")
    except Consignment.DoesNotExist:
        print(f"✓ Confirmed: Consignment is deleted")
except Exception as e:
    print(f"✗ Delete failed: {e}")

# Test 5: API Response Format
print("\n5. Testing API Serialization...")
from apps.consignments.serializers import ConsignmentListSerializer, ConsignmentDetailSerializer

# Get an existing consignment
existing = Consignment.objects.first()
if existing:
    # Test list serializer
    serializer_list = ConsignmentListSerializer(existing)
    print(f"✓ ConsignmentListSerializer works")
    data = serializer_list.data
    print(f"  Fields: {list(data.keys())}")
    print(f"  Has image_url: {'image_url' in data}")
    
    # Test detail serializer
    serializer_detail = ConsignmentDetailSerializer(existing)
    print(f"✓ ConsignmentDetailSerializer works")
    data = serializer_detail.data
    print(f"  Fields: {list(data.keys())}")
    print(f"  Has image_url: {'image_url' in data}")
    print(f"  Has history: {'history' in data}")

print("\n" + "=" * 60)
print("ORM TEST COMPLETE")
print("=" * 60)
