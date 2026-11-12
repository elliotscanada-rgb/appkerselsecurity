"""
Django management command to create comprehensive test data for end-to-end testing
Usage: python manage.py create_test_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.clients.models import Client
from apps.staff.models import Staff
from apps.consignments.models import Consignment
from apps.shipments.models import Shipment, ShipmentLocation
from apps.valuations.models import Valuation

User = get_user_model()


class Command(BaseCommand):
    help = 'Create comprehensive test data for testing RBAC and tracking workflows'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Creating test data...'))
        
        # Get test users
        try:
            admin_user = User.objects.get(email='admin@test.com')
            client_user = User.objects.get(email='client@test.com')
            staff_user = User.objects.get(email='staff@test.com')
            client_profile = Client.objects.get(user=client_user)
            staff_profile = Staff.objects.get(user=staff_user)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Test users not found! Run create_test_users first.'))
            return

        # Create test consignments
        consignments_data = [
            {
                'item_name': 'Gold Bullion Bar 24K',
                'category': 'gold_bars',
                'declared_value': 50000.00,
                'weight': 5.0,
                'weight_unit': 'kg',
                'status': 'pending',
                'description': 'Premium 24K gold bullion bar for testing'
            },
            {
                'item_name': 'Gold Jewelry Collection',
                'category': 'gold_jewellery',
                'declared_value': 75000.00,
                'weight': 2.5,
                'weight_unit': 'kg',
                'status': 'approved',
                'description': 'Collection of gold jewelry items'
            },
            {
                'item_name': 'Precious Gemstones',
                'category': 'diamonds',
                'declared_value': 100000.00,
                'weight': 0.5,
                'weight_unit': 'kg',
                'status': 'received',
                'description': 'Certified precious gemstones and diamonds'
            }
        ]

        created_consignments = []
        for data in consignments_data:
            consignment, created = Consignment.objects.get_or_create(
                client=client_profile,
                item_name=data['item_name'],
                defaults={
                    'category': data['category'],
                    'declared_value': data['declared_value'],
                    'declared_value_currency': 'USD',
                    'weight': data['weight'],
                    'weight_unit': data['weight_unit'],
                    'status': data['status'],
                    'description': data['description'],
                    'received_by': staff_profile,
                    'received_date': timezone.now(),
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Consignment created: {consignment.consignment_number} - {data["item_name"]}'
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f'✓ Consignment exists: {consignment.consignment_number} - {data["item_name"]}'
                ))
            
            created_consignments.append(consignment)

        # Create shipments for consignments
        shipments_data = [
            {
                'consignment_index': 0,  # Gold Bullion
                'origin': 'Nairobi, Kenya',
                'destination': 'London, UK',
                'transport_mode': 'air',
                'status': 'preparing',
                'origin_lat': -1.2921,
                'origin_lng': 36.8219,
                'dest_lat': 51.5074,
                'dest_lng': -0.1278,
            },
            {
                'consignment_index': 1,  # Gold Jewelry
                'origin': 'Dubai, UAE',
                'destination': 'New York, USA',
                'transport_mode': 'air',
                'status': 'dispatched',
                'origin_lat': 25.2048,
                'origin_lng': 55.2708,
                'dest_lat': 40.7128,
                'dest_lng': -74.0060,
            },
            {
                'consignment_index': 2,  # Gemstones
                'origin': 'Antwerp, Belgium',
                'destination': 'Tokyo, Japan',
                'transport_mode': 'sea',
                'status': 'in_transit',
                'origin_lat': 51.2195,
                'origin_lng': 4.4025,
                'dest_lat': 35.6762,
                'dest_lng': 139.6503,
            }
        ]

        created_shipments = []
        for data in shipments_data:
            consignment = created_consignments[data['consignment_index']]
            
            shipment, created = Shipment.objects.get_or_create(
                consignment=consignment,
                defaults={
                    'origin': data['origin'],
                    'destination': data['destination'],
                    'transport_mode': data['transport_mode'],
                    'status': data['status'],
                    'assigned_to': staff_profile,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Shipment created: {shipment.shipment_number} - {data["origin"]} → {data["destination"]}'
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f'✓ Shipment exists: {shipment.shipment_number} - {data["origin"]} → {data["destination"]}'
                ))
            
            created_shipments.append((shipment, data))

        # Create location records for shipments
        location_data = [
            {
                'shipment_index': 0,
                'location_type': 'origin',
                'address': 'Kenyatta International Airport',
                'city': 'Nairobi',
                'country': 'Kenya',
                'lat': -1.3192,
                'lng': 36.9281,
            },
            {
                'shipment_index': 1,
                'location_type': 'origin',
                'address': 'Dubai International Airport',
                'city': 'Dubai',
                'country': 'UAE',
                'lat': 25.2532,
                'lng': 55.3657,
            },
            {
                'shipment_index': 1,
                'location_type': 'current',
                'address': 'Over Atlantic Ocean',
                'city': 'Atlantic',
                'country': 'International Waters',
                'lat': 45.5,
                'lng': -30.0,
            },
            {
                'shipment_index': 2,
                'location_type': 'origin',
                'address': 'Port of Antwerp',
                'city': 'Antwerp',
                'country': 'Belgium',
                'lat': 51.3223,
                'lng': 4.2846,
            },
            {
                'shipment_index': 2,
                'location_type': 'current',
                'address': 'Suez Canal',
                'city': 'Suez',
                'country': 'Egypt',
                'lat': 29.9668,
                'lng': 32.5874,
            },
        ]

        for data in location_data:
            shipment, _ = created_shipments[data['shipment_index']]
            
            location, created = ShipmentLocation.objects.get_or_create(
                shipment=shipment,
                location_type=data['location_type'],
                latitude=data['lat'],
                longitude=data['lng'],
                defaults={
                    'address': data['address'],
                    'city': data['city'],
                    'country': data['country'],
                    'recorded_by': staff_profile,
                }
            )
            
            if created:
                self.stdout.write(f"  ✓ Location recorded: {data['location_type']} - {data['address']}")

        # Create valuations (optional - skip if table doesn't exist)
        try:
            for consignment in created_consignments:
                valuation, created = Valuation.objects.get_or_create(
                    consignment=consignment,
                    defaults={
                        'valuation_method': 'market_assessment',
                        'assessed_value': consignment.declared_value,
                        'assessed_value_currency': 'USD',
                        'notes': f'Assessment of {consignment.item_name}',
                        'valued_by': staff_profile,
                        'approval_status': 'approved',
                        'approved_by': admin_user,
                        'valuation_date': timezone.now(),
                    }
                )
                
                if created:
                    self.stdout.write(f"  ✓ Valuation created for {consignment.consignment_number}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Skipping valuations: {e}"))

        self.stdout.write(self.style.SUCCESS('\n✅ Test data created successfully!'))
        self.stdout.write('\nCreated:')
        self.stdout.write(f'  • {len(created_consignments)} consignments')
        self.stdout.write(f'  • {len(created_shipments)} shipments with {len(location_data)} location records')
        self.stdout.write('\nTest Scenarios:')
        self.stdout.write('  1. Pending Consignment (status=pending)')
        self.stdout.write('     → Client should NOT see tracking (not authorized)')
        self.stdout.write('  2. Approved Consignment (status=approved)')
        self.stdout.write('     → Client should see consignment and tracking data')
        self.stdout.write('  3. Received Consignment (status=received)')
        self.stdout.write('     → Client should see with Shipment tracking and location history')
        self.stdout.write('\nNext Steps:')
        self.stdout.write('  1. Log in as client@test.com and verify visibility')
        self.stdout.write('  2. Log in as admin@test.com and update statuses')
        self.stdout.write('  3. Verify client sees updated data in real-time')
