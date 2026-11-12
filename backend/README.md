# KESTREL SECURITY - Django Backend API

## Gold & Valuables Consignment Management System - REST API

This is the Django REST Framework backend for Kestrel Security's consignment management system.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 13 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create PostgreSQL database:
```sql
CREATE DATABASE kestrel_security;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE kestrel_security TO postgres;
```

6. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your database credentials
```

7. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

8. Create superuser:
```bash
python manage.py createsuperuser
```

9. Run development server:
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

---

## 📚 API Documentation

### Swagger UI
Visit: `http://localhost:8000/api/docs/`

### API Schema
Visit: `http://localhost:8000/api/schema/`

---

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication.

### Obtain Token
**POST** `/api/auth/login/`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {...},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "Login successful"
}
```

### Use Token
Include in header:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📁 Project Structure

```
backend/
├── kestrel_security/          # Main project settings
│   ├── settings.py            # Django settings
│   ├── urls.py                # Main URL configuration
│   └── wsgi.py                # WSGI application
├── apps/                      # Django applications
│   ├── accounts/              # User authentication
│   ├── clients/               # Client management
│   ├── staff/                 # Staff management
│   ├── consignments/          # Consignment tracking
│   ├── valuations/            # Valuation management
│   ├── shipments/             # Shipment tracking
│   ├── custody/               # Custody records
│   ├── storage/               # Storage management
│   ├── documents/             # Document handling
│   ├── notifications/         # Notifications
│   └── audit/                 # Audit logs
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
└── .env                       # Environment variables
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/update/` - Update profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Clients
- `GET /api/clients/` - List all clients (Admin only)
- `POST /api/clients/` - Create new client (Admin only)
- `GET /api/clients/{id}/` - Get client details
- `PUT /api/clients/{id}/` - Update client (Admin only)
- `DELETE /api/clients/{id}/` - Delete client (Admin only)
- `GET /api/clients/me/` - Get current client profile
- `GET /api/clients/{id}/consignments/` - Get client's consignments

### Staff
- `GET /api/staff/` - List all staff (Admin only)
- `POST /api/staff/` - Create new staff (Admin only)
- `GET /api/staff/{id}/` - Get staff details
- `PUT /api/staff/{id}/` - Update staff (Admin only)
- `DELETE /api/staff/{id}/` - Delete staff (Admin only)
- `GET /api/staff/me/` - Get current staff profile

### Consignments
- `GET /api/consignments/` - List consignments
- `POST /api/consignments/` - Create new consignment (Admin/Staff)
- `GET /api/consignments/{id}/` - Get consignment details
- `PUT /api/consignments/{id}/` - Update consignment (Admin/Staff)
- `DELETE /api/consignments/{id}/` - Delete consignment (Admin only)
- `GET /api/consignments/my_consignments/` - Get current client's consignments
- `GET /api/consignments/statistics/` - Get statistics
- `POST /api/consignments/{id}/update_status/` - Update status

### Valuations
- `GET /api/valuations/valuations/` - List valuations
- `POST /api/valuations/valuations/` - Create valuation
- `GET /api/valuations/charges/` - List service charges
- `POST /api/valuations/charges/` - Create service charge

### Shipments
- `GET /api/shipments/` - List shipments
- `POST /api/shipments/` - Create shipment
- `GET /api/shipments/{id}/` - Get shipment details
- `PUT /api/shipments/{id}/` - Update shipment

### Custody Records
- `GET /api/custody/` - List custody records
- `POST /api/custody/` - Create custody record
- `GET /api/custody/{id}/` - Get custody record

### Storage
- `GET /api/storage/facilities/` - List storage facilities
- `POST /api/storage/facilities/` - Create facility
- `GET /api/storage/units/` - List storage units
- `POST /api/storage/units/` - Create storage unit

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/` - Get document

### Notifications
- `GET /api/notifications/` - List user notifications
- `POST /api/notifications/` - Create notification
- `PUT /api/notifications/{id}/` - Mark as read

### Audit Logs
- `GET /api/audit/` - List audit logs (Admin only)
- `GET /api/audit/{id}/` - Get audit log details

---

## 💾 Database Models

### User
- Custom user model with email authentication
- Roles: client, admin, staff
- Password hashing with Argon2

### Client
- Linked to User model
- Unique client number
- Contact information

### Staff
- Linked to User model
- Department assignment
- Unique staff number

### Consignment
- Item details and tracking
- Status tracking
- Valuation information
- Client ownership

### Valuation
- Assessed value
- Approval workflow
- Service charges

### Shipment
- Origin and destination
- Tracking status
- Assignment to staff

### Custody Record
- Transfer tracking
- Location history
- Custodian assignment

### Storage
- Facilities and units
- Capacity management
- Occupancy tracking

### Document
- File upload
- Document types
- Access control

### Notification
- User notifications
- Type categorization
- Read status

### Audit Log
- Action tracking
- User activity
- Change history

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Argon2 password hashing
- **Role-Based Access Control** - Admin, Client, Staff roles
- **CORS Configuration** - Controlled cross-origin requests
- **SQL Injection Protection** - Django ORM safeguards
- **XSS Protection** - Django template escaping
- **CSRF Protection** - Cross-site request forgery protection

---

## 🧪 Testing

Run tests:
```bash
pytest
```

With coverage:
```bash
pytest --cov=apps
```

---

## 📝 Environment Variables

Required variables in `.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=kestrel_security
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🔧 Development Commands

### Create migrations
```bash
python manage.py makemigrations
```

### Apply migrations
```bash
python manage.py migrate
```

### Create superuser
```bash
python manage.py createsuperuser
```

### Run development server
```bash
python manage.py runserver
```

### Run on different port
```bash
python manage.py runserver 8080
```

### Collect static files
```bash
python manage.py collectstatic
```

### Shell access
```bash
python manage.py shell
```

---

## 📊 Admin Panel

Access Django admin at: `http://localhost:8000/admin/`

Login with superuser credentials.

---

## 🚀 Deployment

### Production Settings

1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure production database
4. Set strong `SECRET_KEY`
5. Enable HTTPS
6. Configure static files serving
7. Set up proper logging

### Using Gunicorn

```bash
pip install gunicorn
gunicorn kestrel_security.wsgi:application --bind 0.0.0.0:8000
```

---

## 📦 Dependencies

Main packages:
- Django 4.2.9
- Django REST Framework 3.14.0
- djangorestframework-simplejwt 5.3.1
- psycopg2-binary 2.9.9
- django-cors-headers 4.3.1
- python-decouple 3.8
- argon2-cffi 23.1.0

See `requirements.txt` for complete list.

---

## 🐛 Troubleshooting

### Database connection error
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

### Module not found
- Activate virtual environment
- Run `pip install -r requirements.txt`

### Migration errors
- Delete migration files (except `__init__.py`)
- Drop and recreate database
- Run `makemigrations` and `migrate` again

### CORS errors
- Check `CORS_ALLOWED_ORIGINS` in `.env`
- Ensure frontend URL is included

---

## 📞 Support

For issues or questions about the backend API, refer to:
- API Documentation: `/api/docs/`
- Django Admin: `/admin/`

---

© 2024 Kestrel Security. All rights reserved.
