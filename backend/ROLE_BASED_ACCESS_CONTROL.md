# Role-Based Access Control (RBAC) Documentation

## Overview

The Kestrel Consignment System implements comprehensive role-based access control across both frontend and backend. Users are assigned one of three roles:
- **Admin**: Full system access, manages all consignments, shipments, and user accounts
- **Staff**: Can view/manage consignments, update shipments, verify assets
- **Client**: Can view only their own consignments and track shipments after authorization

## User Roles & Permissions

### 1. Admin User
**Permissions:**
- Create, read, update, delete all consignments
- Create, read, update, delete all shipments
- Manage all assets and valuations
- Create and manage client accounts
- Create and manage staff accounts
- View all reports and audit logs
- Update consignment status and location
- Approve shipments and valuations
- Configure system fees and policies

**API Access:**
```
GET    /api/consignments/             → View all consignments
POST   /api/consignments/             → Create consignment
GET    /api/consignments/{id}/        → View consignment details
PUT    /api/consignments/{id}/        → Update consignment
DELETE /api/consignments/{id}/        → Delete consignment

GET    /api/shipments/                → View all shipments
POST   /api/shipments/                → Create shipment
PUT    /api/shipments/{id}/           → Update shipment
DELETE /api/shipments/{id}/           → Delete shipment

GET    /api/reports/                  → Generate reports
GET    /api/audit/                    → View audit logs
```

**Frontend Routes:**
```
/admin/dashboard                       → Main admin dashboard
/admin/management                      → Create/manage consignments & shipments
/admin/clients                         → Manage client accounts
/admin/staff                           → Manage staff accounts
/admin/reports                         → View reports
/admin/audit                           → View audit logs
```

---

### 2. Staff User
**Permissions:**
- View all consignments (read-only on status)
- Update consignment status and location
- Create and update shipments assigned to them
- Verify assets and valuations
- Add location tracking data
- View their assigned tasks

**API Access:**
```
GET    /api/consignments/             → View all consignments (read-only)
GET    /api/consignments/{id}/        → View consignment details
POST   /api/consignments/{id}/update_status/  → Update status

GET    /api/shipments/                → View all shipments
POST   /api/shipments/                → Create assigned shipment
PATCH  /api/shipments/{id}/status/    → Update shipment status

POST   /api/locations/                → Add location tracking
GET    /api/valuations/               → View valuations
PATCH  /api/valuations/{id}/approve/  → Approve valuations
```

**Frontend Routes:**
```
/staff/dashboard                       → Staff dashboard with assigned tasks
/staff/receiving                       → Receive new consignments
/staff/valuation                       → Verify and valuate assets
/staff/dispatch                        → Dispatch shipments
/staff/logistics                       → Track shipments
```

---

### 3. Client User
**Permissions:**
- View only their own consignments
- View tracking information for authorized shipments
- Download documents related to their consignments
- View valuation summaries
- View payment/fee details
- Submit document uploads

**API Access:**
```
GET    /api/consignments/my_consignments/    → Get user's consignments
GET    /api/consignments/{id}/               → View only if owner
GET    /api/consignments/{id}/tracking_info/ → View tracking (if shipment authorized)

GET    /api/documents/my_documents/          → Download own documents
GET    /api/valuations/my_valuations/        → View own valuations
POST   /api/documents/upload/                → Upload documents
```

**Frontend Routes:**
```
/client/dashboard                      → Client dashboard with overview
/client/tracking                       → Real-time shipment tracking
/client/consignments                   → View all their consignments
/client/documents                      → Manage documents
/client/profile                        → Update profile
```

---

## Data Filtering by Role

### Backend Implementation

#### Django ViewSet get_queryset() Method

```python
def get_queryset(self):
    """Filter queryset based on user role and permissions."""
    user = self.request.user
    base_queryset = Consignment.objects.select_related(
        'client', 'client__user', 'received_by', 'received_by__user'
    ).prefetch_related('history', 'shipments', 'valuations')
    
    if user.role == 'admin':
        # Admin sees all consignments
        return base_queryset
    elif user.role == 'staff':
        # Staff sees all consignments they can work with
        return base_queryset
    elif user.role == 'client':
        # Client sees only their own consignments
        return base_queryset.filter(client__user=user)
    
    return Consignment.objects.none()
```

#### Serializer-Level Field Filtering

```python
class ClientConsignmentListSerializer(serializers.ModelSerializer):
    """Serializer for client users - excludes admin-only fields."""
    
    class Meta:
        model = Consignment
        fields = [
            'id',
            'consignment_number',
            'item_name',
            'category',
            'declared_value',
            'status',
            'received_date',
            'shipments',  # Nested - shows tracking info
            'payment_status',
        ]
        # Admin-only fields NOT included:
        # - fee_breakdown
        # - insurance_amount
        # - internal_notes
```

---

### Frontend Implementation

#### useAuth Hook for Role Checking

```javascript
const { user, hasRole } = useAuth();

// Check user role
if (hasRole('admin')) {
    // Show admin features
}

if (hasRole('client')) {
    // Show client-only features
}
```

#### Protected Routes with Role Enforcement

```javascript
<Route
    path="/admin/management"
    element={
        <ProtectedRoute role="admin">
            <AdminManagementDashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/client/tracking"
    element={
        <ProtectedRoute role="client">
            <ClientTrackingDashboard />
        </ProtectedRoute>
    }
/>
```

#### API Request Filtering

```javascript
const fetchConsignments = async () => {
    const response = await consignmentApi.getConsignments();
    
    // Backend automatically filters based on user role:
    // - Admin: returns all consignments
    // - Staff: returns all consignments (for management)
    // - Client: returns only their consignments
};
```

---

## Tracking Authorization Flow

Client users can only see tracking information after:

1. **Consignment Status**: Must be >= "approved"
2. **Shipment Status**: Must be "dispatched" or later
3. **Payment Status**: Must be "paid" or "released"
4. **Authorization**: Admin must explicitly authorize tracking

### Implementation

```python
def canViewTracking(consignment):
    """Determine if client can view tracking info."""
    return (
        consignment.status in ['approved', 'in_secure_storage', 'in_transit', 'completed'] and
        consignment.payment_status == 'paid' and
        consignment.shipments.filter(
            status__in=['dispatched', 'in_transit', 'arrived', 'delivered']
        ).exists()
    )
```

---

## Security Best Practices

### 1. Token-Based Authentication
- All API requests require Bearer token in Authorization header
- Tokens stored securely in localStorage (consider httpOnly in production)
- Token validation on backend for every request

```javascript
const getAuthToken = () => {
    return localStorage.getItem('kestrel_token');
};

// Header: Authorization: Bearer {token}
```

### 2. Backend Permission Validation
- Every ViewSet implements get_permissions() method
- get_queryset() filters data by user role
- Serializers exclude sensitive fields for non-admin users

### 3. Frontend Role Checking
- ProtectedRoute component enforces route-level access control
- useAuth hook provides role information to components
- Conditional rendering based on user role

### 4. API Response Filtering
- Server returns only fields appropriate for user role
- Client-side filtering is NOT sufficient - server-side filtering is mandatory
- Clients attempting unauthorized API calls receive 403 Forbidden

---

## Common Permission Scenarios

### Scenario 1: Admin Creates Consignment
```
1. Admin navigates to /admin/management
2. Clicks "Create New" → "Consignment"
3. Submits form with consignment details
4. POST /api/consignments/ → 201 Created
5. Consignment appears in admin dashboard
6. Consignment NOT visible to client yet (status = pending)
```

### Scenario 2: Client Views Tracking After Authorization
```
1. Client logs in, navigates to /client/tracking
2. Frontend calls GET /api/consignments/my_consignments/
3. Backend filters to return only their consignments
4. Client sees their consignment with status = "approved"
5. Client clicks on consignment
6. Frontend checks canViewTracking() → true
7. LocationMap displays origin → current → destination
8. Real-time updates via shipment location data
```

### Scenario 3: Staff Updates Shipment Status
```
1. Staff logs in, navigates to /staff/dispatch
2. Staff scans shipment barcode
3. Frontend calls PATCH /api/shipments/{id}/status/
4. Backend checks user.role == 'staff' → permitted
5. Status updated to "dispatched"
6. Client receives notification of shipment dispatch
7. Client can now view tracking (if not already visible)
```

---

## Testing Role-Based Access

### Create Test Users

```bash
# Django shell
python manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

# Admin user
User.objects.create_user(
    email='admin@test.com',
    password='admin123456',
    role='admin'
)

# Staff user
User.objects.create_user(
    email='staff@test.com',
    password='staff123456',
    role='staff'
)

# Client user
User.objects.create_user(
    email='client@test.com',
    password='client123456',
    role='client'
)
```

### Test API Endpoints

```bash
# Login as client
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com", "password":"client123456"}'

# Response: { "access": "token...", "user": {...} }

# Get client's consignments
curl -X GET http://localhost:8000/api/consignments/my_consignments/ \
  -H "Authorization: Bearer {token}"

# Try to view all consignments (should be filtered)
curl -X GET http://localhost:8000/api/consignments/ \
  -H "Authorization: Bearer {token}"

# Try to create consignment (should get 403 Forbidden)
curl -X POST http://localhost:8000/api/consignments/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: 403 Forbidden - Only administrators can create consignments
```

---

## Troubleshooting Permission Issues

### Issue: Client Can See Other Client's Data
**Solution:**
1. Verify get_queryset() filters by client__user=user
2. Check Serializer is not exposing client object
3. Verify token belongs to correct user

### Issue: Admin Gets Forbidden on Create
**Solution:**
1. Check user.role == 'admin' in database
2. Verify token has proper permissions
3. Check get_permissions() in ViewSet

### Issue: Tracking Data Not Visible to Client
**Solution:**
1. Verify consignment status >= 'approved'
2. Verify shipment status = 'dispatched' or later
3. Verify payment_status = 'paid'
4. Check canViewTracking() logic in frontend

---

## Migration Checklist

- [ ] All users assigned appropriate role (admin/staff/client)
- [ ] Client users linked to Client profile (not User directly)
- [ ] Staff users linked to Staff profile
- [ ] Permission validators implemented in all ViewSets
- [ ] Frontend routes protected with ProtectedRoute component
- [ ] API calls use appropriate endpoints (my_consignments vs consignments)
- [ ] Serializers exclude sensitive fields for client users
- [ ] Testing completed with test users from each role

