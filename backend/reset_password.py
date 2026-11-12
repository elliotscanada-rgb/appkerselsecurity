#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("=== Resetting Admin Password ===\n")

# Find and update admin user
try:
    admin_user = User.objects.get(email='admin@kestrel.com')
    admin_user.set_password('Admin@123456')
    admin_user.save()
    
    print(f"✓ Password reset successfully")
    print(f"  Email: {admin_user.email}")
    print(f"  Password: Admin@123456")
    
    # Verify
    if admin_user.check_password('Admin@123456'):
        print(f"✓ Password verification successful")
    else:
        print(f"✗ Password verification failed!")
        
except User.DoesNotExist:
    print("✗ Admin user not found")

# Also reset for other admin users
print("\n=== Resetting All Admin Users ===")
for user in User.objects.filter(role='admin'):
    user.set_password('Admin@123456')
    user.save()
    print(f"✓ {user.email} - password reset")

print("\n=== Test Login ===")
from apps.accounts.serializers import LoginSerializer

for email in ['admin@kestrel.com', 'kimemia03@gmail.com']:
    serializer = LoginSerializer(data={'email': email, 'password': 'Admin@123456'})
    if serializer.is_valid():
        print(f"✓ {email} - Login OK")
    else:
        print(f"✗ {email} - Login FAILED: {serializer.errors}")
