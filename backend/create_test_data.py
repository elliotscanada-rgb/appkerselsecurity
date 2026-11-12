#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client
from apps.consignments.models import Consignment
from apps.shipments.models import Shipment

User = get_user_model()

print("=== Creating Test Data for Brian ===\n")

# 1. Create Brian user
try:
    brian_user = User.objects.get(email='brian@kestrel.com')
    print(f"✓ Brian user already exists: {brian_user.email}")
except User.DoesNotExist:
    brian_user = User.objects.create_user(
        email='brian@kestrel.com',
        password='Brian@123456',
        first_name='Brian',
        last_name='Johnson',
        role='client'
    )
    print(f"✓ Created Brian user: {brian_user.email}")

# 2. Create/Get Brian's Client profile
brian_client, created = Client.objects.get_or_create(user=brian_user)
if created:
    print(f"✓ Created Client profile for Brian")
else:
    print(f"✓ Brian's Client profile already exists")

# 3. Create Consignments for Brian
consignments_data = [
    {
        'client': brian_client,
        'consignment_number': 'BRIAN-2026-001',
        'item_name': 'Gold Bullion 24K',
        'category': 'gold_bars',
        'quantity': 5,
        'weight': 155.5,
        'weight_unit': 'g',
        'purity': 99.9,
        'declared_value': 25000,
        'status': 'in_secure_storage',
        'received_date': '2024-01-15',
    },
    {
        'client': brian_client,
        'consignment_number': 'BRIAN-2026-002',
        'item_name': 'Diamond Stones VVS1',
        'category': 'diamonds',
        'quantity': 10,
        'weight': 25.0,
        'weight_unit': 'g',
        'purity': 100.0,
        'declared_value': 18500,
        'status': 'in_transit',
        'received_date': '2024-01-20',
    },
    {
        'client': brian_client,
        'consignment_number': 'BRIAN-2026-003',
        'item_name': 'Gold Jewellery Set 18K',
        'category': 'gold_jewellery',
        'quantity': 8,
        'weight': 120.0,
        'weight_unit': 'g',
        'purity': 75.0,
        'declared_value': 12000,
        'status': 'approved',
        'received_date': '2024-01-25',
    },
]

print("\n=== Creating Consignments ===")
consignments = []
for data in consignments_data:
    consignment, created = Consignment.objects.get_or_create(
        consignment_number=data['consignment_number'],
        defaults=data
    )
    consignments.append(consignment)
    status = "created" if created else "exists"
    print(f"✓ {data['consignment_number']} - {status}")

# 4. Create Shipments for consignments in transit or approved
print("\n=== Creating Shipments ===")
shipments_data = [
    {
        'consignment': consignments[0],
        'shipment_number': 'SHIP-BRIAN-001',
        'origin': 'Nairobi, Kenya',
        'destination': 'London, United Kingdom',
        'transport_mode': 'air',
        'status': 'in_transit',
    },
    {
        'consignment': consignments[1],
        'shipment_number': 'SHIP-BRIAN-002',
        'origin': 'Johannesburg, South Africa',
        'destination': 'New York, USA',
        'transport_mode': 'air',
        'status': 'preparing',
    },
    {
        'consignment': consignments[2],
        'shipment_number': 'SHIP-BRIAN-003',
        'origin': 'Dubai, UAE',
        'destination': 'Singapore',
        'transport_mode': 'sea',
        'status': 'dispatched',
    },
]

for data in shipments_data:
    shipment, created = Shipment.objects.get_or_create(
        shipment_number=data['shipment_number'],
        defaults=data
    )
    status = "created" if created else "exists"
    print(f"✓ {data['shipment_number']} - {status}")

print("\n=== Summary ===")
print(f"✓ Brian's email: brian@kestrel.com")
print(f"✓ Brian's password: Brian@123456")
print(f"✓ Brian's consignments: {len(consignments)}")
print(f"✓ Brian's shipments: {len(shipments_data)}")

print("\n=== Database Stats ===")
print(f"Total clients: {Client.objects.count()}")
print(f"Total consignments: {Consignment.objects.count()}")
print(f"Total shipments: {Shipment.objects.count()}")

print("\n✅ Test data creation complete!")
