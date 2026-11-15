from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

SEED_USERS = [
    {
        'email': 'michaelhoms@gmail.com',
        'password': 'Buffers316',
        'first_name': 'Michael',
        'last_name': 'Homs',
        'role': 'client',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'michaelhoms+admin@gmail.com',
        'password': 'Buffers316',
        'first_name': 'Michael',
        'last_name': 'Homs',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    },
]


class Command(BaseCommand):
    help = 'Seed test users into the database'

    def handle(self, *args, **options):
        for data in SEED_USERS:
            email = data['email']
            try:
                user = User.objects.get(email=email)
                user.is_staff = data['is_staff']
                user.is_superuser = data['is_superuser']
                user.role = data['role']
                user.is_active = True
                user.set_password(data['password'])
                user.save(update_fields=['is_staff', 'is_superuser', 'role', 'is_active', 'password'])
                # Ensure client profile exists if role is client
                if data['role'] == 'client':
                    from apps.clients.models import Client
                    Client.objects.get_or_create(user=user)
                self.stdout.write(self.style.SUCCESS(f'Updated user: {email} | Role: {data["role"]} | Password reset'))
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    password=data['password'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    role=data['role'],
                )
                user.is_staff = data['is_staff']
                user.is_superuser = data['is_superuser']
                user.is_active = True
                user.save(update_fields=['is_staff', 'is_superuser', 'is_active'])
                # Create client profile if role is client
                if data['role'] == 'client':
                    from apps.clients.models import Client
                    Client.objects.get_or_create(user=user)
                self.stdout.write(self.style.SUCCESS(f'Created user: {email} | Role: {data["role"]}'))
