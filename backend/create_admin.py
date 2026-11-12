#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("=== Creating Admin User ===\n")

# Delete existing admin@kestrel.com if it exists
User.objects.filter(email='admin@kestrel.com').delete()
print("Cleared old admin user")

# Create new admin user with correct password hashing
admin_user = User.objects.create_superuser(
    email='admin@kestrel.com',
    password='Admin@123456',
    first_name='Admin',
    last_name='User',
    role='admin'
)

print(f"✓ Admin user created successfully")
print(f"  Email: {admin_user.email}")
print(f"  First name: {admin_user.first_name}")
print(f"  Last name: {admin_user.last_name}")
print(f"  Role: {admin_user.role}")
print(f"  Is staff: {admin_user.is_staff}")
print(f"  Is superuser: {admin_user.is_superuser}")
print(f"  Is active: {admin_user.is_active}")

# Verify password works
if admin_user.check_password('Admin@123456'):
    print(f"✓ Password verification successful")
else:
    print(f"✗ Password verification failed!")

print("\n=== Credentials ===")
print(f"Email: admin@kestrel.com")
print(f"Password: Admin@123456")
