#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("=== Checking Users ===")
# Check if admin user exists
admin_user = User.objects.filter(email='admin@kestrel.com').first()
if admin_user:
    print(f"✓ Admin user exists: {admin_user.email}")
    print(f"  First name: {admin_user.first_name}")
    print(f"  Last name: {admin_user.last_name}")
    print(f"  Role: {getattr(admin_user, 'role', 'No role field')}")
    print(f"  Is staff: {admin_user.is_staff}")
    print(f"  Is superuser: {admin_user.is_superuser}")
    print(f"  Is active: {admin_user.is_active}")
else:
    print("✗ Admin user does not exist")

# List all users
print("\n=== All Users in Database ===")
for user in User.objects.all():
    role = getattr(user, 'role', 'N/A')
    print(f"- Email: {user.email}")
    print(f"  Role: {role}")
    print(f"  Active: {user.is_active}")
    print(f"  Superuser: {user.is_superuser}\n")

# Count users
print(f"Total users: {User.objects.count()}")
