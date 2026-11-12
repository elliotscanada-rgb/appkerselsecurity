#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

print("=== Deleting All Users (Including Superusers) from Database ===\n")

# Get count before deletion
user_count = User.objects.count()
superuser_count = User.objects.filter(is_superuser=True).count()
print(f"Current Database State:")
print(f"  Total Users: {user_count}")
print(f"  Superusers: {superuser_count}")

# Confirm deletion
confirm = input("\nAre you sure you want to DELETE ALL USERS including superusers? (yes/no): ").strip().lower()

if confirm != 'yes':
    print("❌ Deletion cancelled. No users were deleted.")
    exit(0)

print("\n🗑️  Deleting all users (including superusers) and related data...\n")

try:
    with connection.cursor() as cursor:
        # Disable foreign key constraints temporarily
        cursor.execute("PRAGMA foreign_keys=OFF;")
        
        # Delete related data first (in reverse dependency order)
        print("  Deleting shipment locations...")
        cursor.execute("DELETE FROM shipment_locations;")
        
        print("  Deleting shipments...")
        cursor.execute("DELETE FROM shipments;")
        
        print("  Deleting consignment history...")
        cursor.execute("DELETE FROM consignment_history;")
        
        print("  Deleting consignments...")
        cursor.execute("DELETE FROM consignments;")
        
        print("  Deleting clients...")
        cursor.execute("DELETE FROM clients;")
        
        print("  Deleting staff...")
        cursor.execute("DELETE FROM staff;")
        
        print("  Deleting ALL users (including superusers)...")
        cursor.execute("DELETE FROM users;")
        
        print("  Clearing Django admin logs...")
        cursor.execute("DELETE FROM django_admin_log;")
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys=ON;")
    
    print(f"\n✅ All data deleted successfully")

except Exception as e:
    print(f"\n❌ Error during deletion: {e}")
    import traceback
    traceback.print_exc()

# Verify deletion
remaining_users = User.objects.count()
remaining_superusers = User.objects.filter(is_superuser=True).count()

print(f"\nDatabase State After Deletion:")
print(f"  Total Users: {remaining_users}")
print(f"  Superusers: {remaining_superusers}")

if remaining_users == 0 and remaining_superusers == 0:
    print("\n✅ All users and superusers successfully deleted!")
    print("✅ Database is clean and ready for new registrations.")
else:
    print(f"\n⚠️  Warning: Some data still exists in database")
