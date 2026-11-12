#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client

User = get_user_model()

# Create admin user
admin, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin.set_password('Admin@123')
    admin.save()
    print(f'✓ Created admin user: {admin.email}')
else:
    print(f'✓ Admin user already exists: {admin.email}')

# Create test client user
client_user, created = User.objects.get_or_create(
    email='client@test.com',
    defaults={
        'first_name': 'Test',
        'last_name': 'Client',
        'role': 'client',
    }
)
if created:
    client_user.set_password('Client@123')
    client_user.save()
    client_profile = Client.objects.create(user=client_user)
    print(f'✓ Created client user: {client_user.email}')
else:
    print(f'✓ Client user already exists: {client_user.email}')
