#!/usr/bin/env python
"""
Test script to verify all CRUD operations work correctly for consignments API
"""
import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client

User = get_user_model()

# Get admin user for auth token
admin_user = User.objects.get(email='admin@test.com')
client_user = User.objects.get(email='client@test.com')
client = Client.objects.get(user=client_user)

BASE_URL = 'http://localhost:8000/api'

# Create auth token (manually for testing)
# In a real test, you'd use Django Rest Framework's token generation
print("=" * 60)
print("TESTING CONSIGNMENT API - FULL CRUD OPERATIONS")
print("=" * 60)

# Get auth token via login
print("\n1. Getting authentication token...")
try:
    login_response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'email': 'admin@test.com', 'password': 'Admin@123'}
    )
    if login_response.status_code == 200:
        token = login_response.json().get('access')
        print(f"✓ Got token: {token[:20]}...")
    else:
        print(f"✗ Login failed: {login_response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Error during login: {e}")
    exit(1)

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Test 1: Create a new consignment
print("\n2. Creating new consignment...")
create_data = {
    'client': client.id,
    'item_name': 'Test Gold Bars',
    'category': 'gold_bars',
    'description': 'Test consignment for API verification',
    'quantity': 5,
    'weight': 100.50,
    'weight_unit': 'g',
    'purity': 99.9,
    'declared_value': 50000.00,
    'declared_value_currency': 'USD',
    'status': 'pending',
    'current_location': 'Vault A',
}

try:
    create_response = requests.post(
        f'{BASE_URL}/consignments/',
        json=create_data,
        headers=headers
    )
    if create_response.status_code in [200, 201]:
        created_consignment = create_response.json()
        consignment_id = created_consignment.get('id')
        print(f"✓ Created consignment ID: {consignment_id}")
        print(f"  Number: {created_consignment.get('consignment_number')}")
    else:
        print(f"✗ Creation failed: {create_response.status_code}")
        print(f"  Response: {create_response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Error during creation: {e}")
    exit(1)

# Test 2: Retrieve the consignment
print("\n3. Retrieving created consignment...")
try:
    get_response = requests.get(
        f'{BASE_URL}/consignments/{consignment_id}/',
        headers=headers
    )
    if get_response.status_code == 200:
        retrieved = get_response.json()
        print(f"✓ Retrieved consignment")
        print(f"  Item: {retrieved.get('item_name')}")
        print(f"  Status: {retrieved.get('status')}")
        print(f"  Value: {retrieved.get('declared_value')}")
    else:
        print(f"✗ Retrieval failed: {get_response.status_code}")
        print(f"  Response: {get_response.text}")
except Exception as e:
    print(f"✗ Error during retrieval: {e}")

# Test 3: Update the consignment
print("\n4. Updating consignment...")
update_data = {
    'status': 'received',
    'current_location': 'Vault B',
    'description': 'Updated description after verification'
}

try:
    update_response = requests.put(
        f'{BASE_URL}/consignments/{consignment_id}/',
        json=update_data,
        headers=headers
    )
    if update_response.status_code == 200:
        updated = update_response.json()
        print(f"✓ Updated consignment")
        print(f"  New Status: {updated.get('status')}")
        print(f"  New Location: {updated.get('current_location')}")
    else:
        print(f"✗ Update failed: {update_response.status_code}")
        print(f"  Response: {update_response.text}")
except Exception as e:
    print(f"✗ Error during update: {e}")

# Test 4: Delete the consignment
print("\n5. Deleting consignment...")
try:
    delete_response = requests.delete(
        f'{BASE_URL}/consignments/{consignment_id}/',
        headers=headers
    )
    if delete_response.status_code in [200, 204]:
        print(f"✓ Deleted consignment {consignment_id}")
    else:
        print(f"✗ Deletion failed: {delete_response.status_code}")
        print(f"  Response: {delete_response.text}")
except Exception as e:
    print(f"✗ Error during deletion: {e}")

# Test 5: Verify it's deleted
print("\n6. Verifying deletion...")
try:
    verify_response = requests.get(
        f'{BASE_URL}/consignments/{consignment_id}/',
        headers=headers
    )
    if verify_response.status_code == 404:
        print(f"✓ Confirmed: Consignment is deleted (404 Not Found)")
    else:
        print(f"✗ Consignment still exists! Status: {verify_response.status_code}")
except Exception as e:
    print(f"✗ Error during verification: {e}")

print("\n" + "=" * 60)
print("API TEST COMPLETE")
print("=" * 60)
