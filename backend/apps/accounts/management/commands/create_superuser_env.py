from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Create or update a superuser from environment variables (for production use)'

    def handle(self, *args, **options):
        email = config('DJANGO_SUPERUSER_EMAIL', default=None)
        password = config('DJANGO_SUPERUSER_PASSWORD', default=None)
        first_name = config('DJANGO_SUPERUSER_FIRST_NAME', default='Admin')
        last_name = config('DJANGO_SUPERUSER_LAST_NAME', default='User')

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    'Skipping superuser creation: '
                    'DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD not set.'
                )
            )
            return

        # Use get_or_create to safely handle existing users
        user, created = User.objects.get_or_create(
            email__iexact=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
            }
        )

        # Always update permissions and password
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.role = 'admin'
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Superuser created: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superuser {email} updated with correct permissions and password.'))
