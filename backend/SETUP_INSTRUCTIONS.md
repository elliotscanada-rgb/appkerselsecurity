# 🎯 KESTREL SECURITY BACKEND - COMPLETE SETUP GUIDE

## Step-by-Step Installation Instructions

---

## ✅ PREREQUISITES

Before starting, ensure you have:

1. **Python 3.10+** installed
   ```bash
   python --version
   ```

2. **PostgreSQL 13+** installed and running
   ```bash
   psql --version
   ```

3. **pip** (Python package manager)
   ```bash
   pip --version
   ```

4. **Git** (optional, for version control)

---

## 📋 STEP 1: DATABASE SETUP

### Create PostgreSQL Database

**Option A: Using psql command line**

```bash
# Open PostgreSQL shell
psql -U postgres

# In psql shell:
CREATE DATABASE kestrel_security;
CREATE USER kestrel_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE kestrel_security TO kestrel_user;
\q
```

**Option B: Using pgAdmin**

1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `kestrel_security`
4. Owner: postgres (or create new user)

---

## 📋 STEP 2: PROJECT SETUP

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Django 4.2.9
- Django REST Framework
- JWT Authentication
- PostgreSQL adapter
- CORS headers
- And more...

---

## 📋 STEP 3: ENVIRONMENT CONFIGURATION

### 1. Configure `.env` File

The `.env` file is already created. Update it with your settings:

```bash
# Open .env in a text editor and update:

SECRET_KEY=your-unique-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=kestrel_security
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# JWT Settings (keep defaults)
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
MAX_UPLOAD_SIZE=10485760
```

### 2. Generate Secret Key (Optional but Recommended)

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and paste it as `SECRET_KEY` in `.env`.

---

## 📋 STEP 4: DATABASE MIGRATIONS

### 1. Create Migrations

```bash
python manage.py makemigrations
```

You should see output like:
```
Migrations for 'accounts':
  apps/accounts/migrations/0001_initial.py
    - Create model User
Migrations for 'clients':
  ...
```

### 2. Apply Migrations

```bash
python manage.py migrate
```

This creates all database tables.

---

## 📋 STEP 5: CREATE SUPERUSER

Create an admin account:

```bash
python manage.py createsuperuser
```

Follow prompts:
```
Email: admin@kestrel.com
Password: (enter secure password)
Password (again): (confirm password)
```

---

## 📋 STEP 6: RUN DEVELOPMENT SERVER

Start the server:

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## 📋 STEP 7: VERIFY INSTALLATION

### 1. Access Admin Panel

Open browser: `http://localhost:8000/admin/`

Login with superuser credentials.

### 2. Access API Documentation

Open browser: `http://localhost:8000/api/docs/`

You should see the Swagger UI.

### 3. Test API Endpoint

**Using cURL:**
```bash
curl http://localhost:8000/api/auth/login/ -H "Content-Type: application/json" -d "{\"email\":\"admin@kestrel.com\",\"password\":\"your_password\"}"
```

**Using Browser (Postman/Insomnia):**
- POST to `http://localhost:8000/api/auth/login/`
- Body: `{"email": "admin@kestrel.com", "password": "your_password"}`

---

## 📋 STEP 8: CREATE SAMPLE DATA (OPTIONAL)

### Create Test Client

```bash
python manage.py shell
```

In the Python shell:
```python
from django.contrib.auth import get_user_model
from apps.clients.models import Client

User = get_user_model()

# Create client user
user = User.objects.create_user(
    email='client@kestrel.com',
    password='password123',
    first_name='John',
    last_name='Doe',
    role='client'
)

# Create client profile
client = Client.objects.create(
    user=user,
    phone='+254700000000',
    address='123 Main Street',
    city='Nairobi',
    country='Kenya'
)

print(f"Client created: {client.client_number}")
exit()
```

### Create Test Staff

```python
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.staff.models import Staff

User = get_user_model()

# Create staff user
user = User.objects.create_user(
    email='staff@kestrel.com',
    password='password123',
    first_name='Jane',
    last_name='Smith',
    role='staff'
)

# Create staff profile
staff = Staff.objects.create(
    user=user,
    department='receiving',
    phone='+254711111111'
)

print(f"Staff created: {staff.staff_number}")
exit()
```

---

## 🔧 COMMON ISSUES AND SOLUTIONS

### Issue 1: "ModuleNotFoundError: No module named..."

**Solution:**
```bash
# Ensure virtual environment is activated
# Windows:
venv\Scripts\activate

# Then reinstall:
pip install -r requirements.txt
```

### Issue 2: Database connection error

**Solution:**
- Verify PostgreSQL is running
- Check database exists: `psql -U postgres -l`
- Verify credentials in `.env`
- Test connection: `psql -U postgres -d kestrel_security`

### Issue 3: Port 8000 already in use

**Solution:**
```bash
# Run on different port
python manage.py runserver 8080
```

### Issue 4: Migration errors

**Solution:**
```bash
# Delete all migration files except __init__.py
# Then recreate:
python manage.py makemigrations
python manage.py migrate
```

### Issue 5: CORS errors from frontend

**Solution:**
- Check `CORS_ALLOWED_ORIGINS` in `.env`
- Ensure it includes your frontend URL (http://localhost:5173)
- Restart Django server

---

## 🚀 CONNECTING TO REACT FRONTEND

### 1. Ensure Backend is Running

```bash
python manage.py runserver
```

Backend should be at: `http://localhost:8000`

### 2. Update Frontend API URL

In `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Test Connection

Login from frontend with:
- Email: `admin@kestrel.com` or `client@kestrel.com`
- Password: (what you set during creation)

---

## 📊 TESTING THE API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"client@kestrel.com","password":"password123"}'
```

**Get Consignments (with token):**
```bash
curl -X GET http://localhost:8000/api/consignments/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import collection (if provided)
2. Set base URL: `http://localhost:8000/api`
3. Login to get token
4. Set token in Authorization header for other requests

---

## 📁 PROJECT FILE CHECKLIST

Ensure these files exist:

```
backend/
├── ✅ manage.py
├── ✅ requirements.txt
├── ✅ .env
├── ✅ README.md
├── ✅ SETUP_INSTRUCTIONS.md
├── kestrel_security/
│   ├── ✅ __init__.py
│   ├── ✅ settings.py
│   ├── ✅ urls.py
│   ├── ✅ wsgi.py
│   └── ✅ asgi.py
└── apps/
    ├── accounts/     ✅
    ├── clients/      ✅
    ├── staff/        ✅
    ├── consignments/ ✅
    ├── valuations/   ✅
    ├── shipments/    ✅
    ├── custody/      ✅
    ├── storage/      ✅
    ├── documents/    ✅
    ├── notifications/✅
    └── audit/        ✅
```

---

## 🎓 NEXT STEPS

After successful setup:

1. **Explore Admin Panel** (`/admin/`)
   - Create users
   - Manage data
   - View models

2. **Test API Endpoints** (`/api/docs/`)
   - Review all endpoints
   - Test authentication
   - Try CRUD operations

3. **Connect Frontend**
   - Update frontend API URL
   - Test login from React app
   - Verify data flow

4. **Create Sample Data**
   - Add test clients
   - Create consignments
   - Test workflows

---

## ✅ VERIFICATION CHECKLIST

Before proceeding, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `kestrel_security` exists
- [ ] Virtual environment is activated
- [ ] All dependencies are installed
- [ ] `.env` file is configured correctly
- [ ] Migrations are applied successfully
- [ ] Superuser is created
- [ ] Development server starts without errors
- [ ] Admin panel is accessible
- [ ] API documentation loads
- [ ] Login endpoint works
- [ ] CORS is configured for frontend

---

## 🎉 SUCCESS!

If all steps completed successfully, your Django backend is ready!

**API Base URL:** `http://localhost:8000/api/`
**Admin Panel:** `http://localhost:8000/admin/`
**API Docs:** `http://localhost:8000/api/docs/`

---

## 📞 NEED HELP?

If you encounter issues:

1. Check error messages carefully
2. Verify all prerequisites are met
3. Review troubleshooting section
4. Check Django logs in terminal
5. Verify database connection
6. Ensure virtual environment is active

---

© 2024 Kestrel Security. All rights reserved.
