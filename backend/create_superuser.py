#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Create Superuser ===\n")

# Superuser credentials
email = input("Enter superuser email: ").strip()
first_name = input("Enter first name: ").strip()
last_name = input("Enter last name: ").strip()
password = input("Enter password: ").strip()
password_confirm = input("Confirm password: ").strip()

# Validation
if not email:
    print("❌ Email is required")
    exit(1)

if not password:
    print("❌ Password is required")
    exit(1)

if password != password_confirm:
    print("❌ Passwords do not match")
    exit(1)

if len(password) < 8:
    print("❌ Password must be at least 8 characters")
    exit(1)

# Check if email already exists
if User.objects.filter(email=email).exists():
    print(f"❌ Email {email} already exists")
    exit(1)

# Create superuser
try:
    superuser = User.objects.create_superuser(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='admin'
    )
    
    print("\n✅ Superuser created successfully!")
    print(f"\nSuperuser Details:")
    print(f"  Email: {superuser.email}")
    print(f"  Name: {superuser.first_name} {superuser.last_name}")
    print(f"  Role: {superuser.role}")
    print(f"  Is Superuser: {superuser.is_superuser}")
    print(f"  Is Staff: {superuser.is_staff}")
    
except Exception as e:
    print(f"❌ Error creating superuser: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
