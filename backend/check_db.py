import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.db import connection
from django.apps import apps

# Check if Consignment table exists
print("Checking database tables...")
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Total tables: {len(tables)}")
    
    consignment_tables = [t for t in tables if 'consignment' in t[0].lower()]
    print(f"\nConsignment tables: {consignment_tables}")
    
    shipment_tables = [t for t in tables if 'shipment' in t[0].lower()]
    print(f"Shipment tables: {shipment_tables}")

# Try to query consignments
from apps.consignments.models import Consignment
try:
    count = Consignment.objects.count()
    print(f"\n✓ Consignment model works: {count} consignments in DB")
except Exception as e:
    print(f"\n✗ Error querying Consignment: {e}")
    import traceback
    traceback.print_exc()
