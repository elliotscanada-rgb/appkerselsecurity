from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        test_users = [
            {
                'email': 'client@test.com',
                'password': 'kestrel123',
                'first_name': 'John',
                'last_name': 'Client',
                'role': 'client',
            },
            {
                'email': 'admin@test.com',
                'password': 'kestrel123',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
            },
            {
                'email': 'staff@test.com',
                'password': 'kestrel123',
                'first_name': 'Staff',
                'last_name': 'User',
                'role': 'staff',
            },
        ]

        for user_data in test_users:
            email = user_data['email']
            password = user_data.pop('password')
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {email} already exists, skipping')
                )
                continue
            
            # Create user
            if user_data['role'] == 'admin':
                user = User.objects.create_superuser(email=email, password=password)
                user.first_name = user_data['first_name']
                user.last_name = user_data['last_name']
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created admin user: {email}')
                )
            else:
                user = User.objects.create_user(email=email, password=password, **user_data)
                self.stdout.write(
                    self.style.SUCCESS(f'Created {user_data["role"]} user: {email}')
                )

        self.stdout.write(self.style.SUCCESS('\n✅ Test users created successfully!\n'))
        self.stdout.write('Test Credentials:')
        self.stdout.write('  Client: client@test.com / kestrel123')
        self.stdout.write('  Admin:  admin@test.com / kestrel123')
        self.stdout.write('  Staff:  staff@test.com / kestrel123')
