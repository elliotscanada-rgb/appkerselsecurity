#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.clients.models import Client
from apps.consignments.models import Consignment

User = get_user_model()

# Show existing users
print('=== EXISTING USERS ===')
for user in User.objects.all():
    print(f'Email: {user.email}, Role: {user.role}')

# Show existing clients
print('\n=== EXISTING CLIENTS ===')
for client in Client.objects.all():
    print(f'Client: {client.full_name}, User: {client.user.email}')

# Show existing consignments
print('\n=== EXISTING CONSIGNMENTS ===')
for consignment in Consignment.objects.all():
    has_image = 'Yes' if consignment.image else 'No'
    print(f'ID: {consignment.id}, Number: {consignment.consignment_number}, Item: {consignment.item_name}, Client: {consignment.client.full_name}, Status: {consignment.status}, Image: {has_image}')
