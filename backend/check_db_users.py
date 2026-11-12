import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kestrel_security.settings')
django.setup()

from apps.accounts.models import User

all_users = User.objects.all()
print(f"\n{'='*60}")
print(f"Total Users in Database: {all_users.count()}")
print(f"{'='*60}\n")

if all_users.count() > 0:
    for user in all_users:
        print(f"Email: {user.email}")
        print(f"  - First Name: {user.first_name}")
        print(f"  - Last Name: {user.last_name}")
        print(f"  - Is Staff: {user.is_staff}")
        print(f"  - Is Superuser: {user.is_superuser}")
        print(f"  - Is Active: {user.is_active}")
        print(f"  - Date Joined: {user.date_joined}")
        print()
else:
    print("No users found in the database.")
    print("\nTo create a superuser, run:")
    print("  python manage.py createsuperuser")
    print("\nOr use the signup page at: http://localhost:5175/signup")

print(f"{'='*60}\n")
