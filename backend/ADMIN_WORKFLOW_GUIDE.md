# Admin Workflow Guide

Complete guide for administrators to manage consignments, shipments, and track items through the system.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Admin Dashboard](#admin-dashboard)
3. [Consignment Management](#consignment-management)
4. [Shipment Management](#shipment-management)
5. [Location Tracking](#location-tracking)
6. [Common Workflows](#common-workflows)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Login to Admin Dashboard

1. Navigate to `http://localhost:5174/login`
2. Enter admin credentials:
   - **Email**: `admin@test.com`
   - **Password**: `admin123456`
3. You will be redirected to `/admin/dashboard`

### Admin Portal Access

From the admin dashboard, you can access:
- **Management Dashboard**: `/admin/management` - CRUD operations for consignments and shipments
- **Tracking Dashboard**: `/admin/tracking` - Real-time asset tracking
- **Clients**: `/admin/clients` - Manage client accounts
- **Staff**: `/admin/staff` - Manage staff members
- **Reports**: `/admin/reports` - View system reports

---

## Admin Dashboard

### Management Dashboard (`/admin/management`)

The Management Dashboard provides a unified interface for creating and managing all consignments and shipments.

#### Features

**Tabbed Interface**:
- **Consignments Tab**: View, create, edit, and delete consignments
- **Shipments Tab**: View, create, edit, and delete shipments

**Search & Filter**:
```
Search by: Consignment number, Item name, or Client email
Filter by: Status (All, Pending, In Transit, Delivered)
```

**Status Indicators**:
- 🟡 Pending - Awaiting approval
- 🔵 Received - Item received at facility
- 🟠 Under Verification - Being verified
- 🔵 Verification Passed - Ready for approval
- 🟢 Approved - Ready for shipment
- 🟣 In Secure Storage - Stored safely
- 🔷 In Transit - Currently shipping
- 🟢 Delivered - Successfully delivered

#### Creating a Consignment

1. Click "Create New" button
2. Fill in the form:
   - **Item Name**: Name of the valuable (e.g., "Gold Bullion Bar 24K")
   - **Category**: Select from dropdown
     - Gold Bars
     - Gold Jewellery
     - Precious Metals
     - Diamonds & Gemstones
     - Other Valuables
   - **Weight**: Numeric value
   - **Weight Unit**: kg, g, oz, or t
   - **Declared Value**: USD amount for insurance
   - **Description**: Additional details
3. Click "Create" to save

#### Editing a Consignment

1. Find consignment in the table
2. Click the ✏️ Edit button
3. Modify fields as needed
4. Click "Update" to save

#### Deleting a Consignment

1. Find consignment in the table
2. Click the 🗑️ Delete button
3. Confirm deletion in the dialog

---

## Consignment Management

### Consignment Lifecycle

```
┌─────────────┐
│   Pending   │ ← Initial state when consignment is created
└──────┬──────┘
       ↓
┌─────────────────────┐
│  Under Verification │ ← Staff verifies the item
└──────┬──────────────┘
       ↓
┌──────────────────────┐
│ Verification Passed  │ ← Item passed quality check
└──────┬───────────────┘
       ↓
┌─────────────┐
│  Approved   │ ← Ready for shipment (CLIENT CAN NOW SEE)
└──────┬──────┘
       ↓
┌────────────────────┐
│ In Secure Storage  │
└──────┬─────────────┘
       ↓
┌───────────────┐
│  In Transit   │ ← Being shipped to client
└──────┬────────┘
       ↓
┌─────────────┐
│  Completed  │ ← Successfully delivered
└─────────────┘
```

### Status Transition Best Practices

**When to set to "Received"**:
- Item has arrived at your facility
- Initial physical inspection completed
- Item is logged into the system

**When to set to "Under Verification"**:
- Detailed inspection by staff is starting
- Authenticity checks in progress
- Weight/purity testing ongoing

**When to set to "Approved"**:
- All verifications passed ✅
- Client can now see the consignment
- Ready to prepare shipment
- **This is when client can start viewing tracking**

**When to set to "In Transit"**:
- Item has been dispatched
- Shipment is on its way
- Client receives tracking updates

---

## Shipment Management

### Creating a Shipment

1. Click on "Shipments" tab in Management Dashboard
2. Click "Create New" button
3. Fill in shipment details:
   - **Origin**: Starting location (e.g., "Nairobi, Kenya")
   - **Destination**: Final location (e.g., "London, UK")
   - **Transport Mode**: 
     - Land Transport (truck)
     - Air Transport (plane)
     - Sea Transport (ship)
     - Rail Transport (train)
   - **Status**: Initial status (usually "Preparing")
4. Click "Create"

### Shipment Status Flow

```
Preparing → Dispatched → In Transit → Arrived → Delivered
```

**Status Meanings**:
- **Preparing**: Shipment being packaged and prepared
- **Dispatched**: Left facility with carrier
- **In Transit**: Currently on the way
- **Arrived**: Reached destination
- **Delivered**: Successfully delivered to client

### Real-Time Tracking Updates

Once a shipment is created, you can add location records:

**For API (POST to `/api/shipments/{id}/update_location/`)**:
```json
{
  "location_type": "current",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "JFK Airport Terminal 1",
  "city": "New York",
  "country": "United States"
}
```

---

## Location Tracking

### Understanding Location Data

Each shipment can have multiple location records:
- **Origin Location**: Starting point
- **Current Location**: Latest position (updated frequently)
- **Destination Location**: Final destination

### Adding Location Updates

The LocationMap component on the client dashboard displays:
- Green marker 🟢 → Origin
- Cyan marker 🔵 → Current location
- Red marker 🔴 → Destination
- Dashed line → Route

### Location Data Structure

```javascript
{
  "shipment_number": "SHP-2026-000001",
  "origin_location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Nairobi, Kenya",
    "city": "Nairobi",
    "country": "Kenya"
  },
  "current_location_data": {
    "lat": 45.5,
    "lng": -30.0,
    "address": "Over Atlantic Ocean",
    "city": "Atlantic",
    "country": "International",
    "recorded_at": "2026-11-10T14:30:00Z"
  },
  "destination_location": {
    "lat": 51.5074,
    "lng": -0.1278,
    "address": "London, UK",
    "city": "London",
    "country": "United Kingdom"
  }
}
```

---

## Common Workflows

### Workflow 1: New Consignment Submission

**Scenario**: Client submits a new gold bar for consignment.

**Steps**:
1. Log in as admin@test.com
2. Go to Admin Dashboard → Management
3. Click "Create New" → Consignment
4. Enter:
   - Item Name: "Gold Bar 99.9% Pure"
   - Category: "Gold Bars"
   - Weight: 10 kg
   - Declared Value: $500,000
5. Click "Create"
6. System creates consignment with status: "Pending"
7. Staff receives notification to begin verification

**Result**: Consignment visible to admin only. Client cannot see until approved.

---

### Workflow 2: Verify & Approve Item

**Scenario**: Staff completes verification, admin approves consignment.

**Steps**:
1. Staff verifies the item (quality, authenticity, weight)
2. Admin updates consignment status: "Under Verification" → "Verification Passed"
3. Admin reviews verification results
4. Admin updates status: "Verification Passed" → "Approved"
5. System notifies client that their item is approved
6. **Client can now see the consignment and access tracking**

**API Call** (Python example):
```python
import requests

url = "http://localhost:8000/api/consignments/1/update_status/"
headers = {
    "Authorization": "Bearer {admin_token}",
    "Content-Type": "application/json"
}
data = {
    "status": "approved",
    "description": "Verification complete, item approved for shipment"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

### Workflow 3: Create & Update Shipment

**Scenario**: Ship approved consignment to client.

**Steps**:
1. Admin goes to Management → Shipments tab
2. Creates new shipment:
   - Origin: "Nairobi, Kenya"
   - Destination: "London, UK"
   - Transport: "Air"
   - Status: "Preparing"
3. Updates consignment status to "In Transit"
4. As shipment progresses, adds location updates:
   - "Departed Nairobi Airport"
   - "Over Sahara"
   - "Approaching Europe"
   - "Landed London"
5. Updates status to "Delivered" when complete

**Client Experience**:
- Receives notification of dispatch
- Views LocationMap with real-time tracking
- Sees estimated arrival time
- Receives delivery confirmation

---

### Workflow 4: Multiple Items in One Shipment

**Scenario**: Shipping 3 consignments together to same destination.

**Steps**:
1. Create 3 separate consignments (may already exist)
2. Approve all 3 consignments
3. Create 1 shipment with:
   - Origin: "Facility A"
   - Destination: "London, UK"
   - Transport: "Sea"
4. Link all 3 consignments to this shipment (via API or in database)
5. Add location updates for the shipment
6. All 3 clients see their items in transit to London

**API Structure**:
Each consignment has a `shipments` array. Query `/api/consignments/{id}/shipments/` to see all shipments for a consignment.

---

## API Endpoints Reference

### Authentication

**Login Endpoint**:
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123456"
}

Response:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

**All subsequent requests require**:
```
Authorization: Bearer {access_token}
```

### Consignment Endpoints

#### List All Consignments
```
GET /api/consignments/

Query Parameters:
  - status: pending, approved, in_transit, completed
  - category: gold_bars, gold_jewellery, diamonds, etc.
  - search: consignment_number or item_name

Response: [
  {
    "id": 1,
    "consignment_number": "KSL-2026-200242",
    "item_name": "Gold Bullion Bar 24K",
    "category": "gold_bars",
    "declared_value": 50000.00,
    "status": "approved",
    "shipments": [
      {
        "id": 1,
        "shipment_number": "SHP-2026-803169",
        "status": "in_transit",
        "origin": "Nairobi, Kenya",
        "destination": "London, UK",
        "origin_location": {...},
        "current_location_data": {...},
        "destination_location": {...}
      }
    ]
  }
]
```

#### Create Consignment
```
POST /api/consignments/
Content-Type: application/json

{
  "item_name": "Gold Jewelry Collection",
  "category": "gold_jewellery",
  "declared_value": 75000,
  "declared_value_currency": "USD",
  "weight": 2.5,
  "weight_unit": "kg",
  "description": "Collection of gold jewelry items"
}

Response: 201 Created
{
  "id": 2,
  "consignment_number": "KSL-2026-462162",
  ...
}
```

#### Get Consignment Details
```
GET /api/consignments/{id}/

Response:
{
  "id": 1,
  "consignment_number": "KSL-2026-200242",
  "item_name": "Gold Bullion Bar 24K",
  "category": "gold_bars",
  "declared_value": 50000.00,
  "status": "approved",
  "weight": 5.0,
  "weight_unit": "kg",
  "received_date": "2026-11-10T12:00:00Z",
  "shipments": [...],
  "history": [...]
}
```

#### Update Consignment Status
```
POST /api/consignments/{id}/update_status/
Content-Type: application/json

{
  "status": "approved",
  "location": "Secure Storage Vault A",
  "description": "Item verified and approved for shipment"
}

Response: 200 OK
{
  "status": "approved",
  "updated_at": "2026-11-10T14:30:00Z"
}
```

#### Delete Consignment
```
DELETE /api/consignments/{id}/

Response: 204 No Content
```

### Shipment Endpoints

#### List All Shipments
```
GET /api/shipments/

Response: [
  {
    "id": 1,
    "shipment_number": "SHP-2026-803169",
    "origin": "Nairobi, Kenya",
    "destination": "London, UK",
    "transport_mode": "air",
    "status": "in_transit",
    "origin_location": {...},
    "current_location_data": {...},
    "destination_location": {...},
    "location_history": [...]
  }
]
```

#### Create Shipment
```
POST /api/shipments/
Content-Type: application/json

{
  "consignment": 1,
  "origin": "Dubai, UAE",
  "destination": "New York, USA",
  "transport_mode": "air",
  "status": "preparing"
}

Response: 201 Created
{
  "id": 2,
  "shipment_number": "SHP-2026-404959",
  ...
}
```

#### Update Shipment Status
```
PATCH /api/shipments/{id}/status/
Content-Type: application/json

{
  "status": "dispatched"
}

Response: 200 OK
{
  "status": "dispatched",
  "updated_at": "2026-11-10T14:30:00Z"
}
```

#### Add Location Update
```
POST /api/shipments/{id}/update_location/
Content-Type: application/json

{
  "location_type": "current",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "JFK Airport Terminal 1",
  "city": "New York",
  "country": "United States"
}

Response: 201 Created
{
  "id": 10,
  "location_type": "current",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "JFK Airport Terminal 1",
  "recorded_at": "2026-11-10T14:35:00Z"
}
```

#### Get Shipment Tracking Data
```
GET /api/shipments/{id}/tracking_data/

Response:
{
  "shipment_number": "SHP-2026-803169",
  "status": "in_transit",
  "origin_location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Nairobi, Kenya"
  },
  "current_location_data": {
    "lat": 45.5,
    "lng": -30.0,
    "address": "Over Atlantic Ocean",
    "recorded_at": "2026-11-10T14:30:00Z"
  },
  "destination_location": {
    "lat": 51.5074,
    "lng": -0.1278,
    "address": "London, UK"
  }
}
```

#### Get Location History
```
GET /api/shipments/{id}/location_history/

Response: [
  {
    "id": 1,
    "location_type": "origin",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "address": "Kenyatta International Airport",
    "city": "Nairobi",
    "country": "Kenya",
    "recorded_at": "2026-11-10T12:00:00Z"
  },
  {
    "id": 2,
    "location_type": "current",
    "latitude": 45.5,
    "longitude": -30.0,
    "address": "Over Atlantic Ocean",
    "city": "Atlantic",
    "country": "International Waters",
    "recorded_at": "2026-11-10T14:30:00Z"
  }
]
```

---

## Troubleshooting

### Client Cannot See Consignment

**Possible Causes**:
1. Consignment status is not "approved" or higher
2. Client user not properly linked to client profile
3. Authentication token expired

**Solution**:
```bash
# Check consignment status
curl -X GET http://localhost:8000/api/consignments/1/ \
  -H "Authorization: Bearer {token}"

# Verify status is 'approved' or 'in_transit'
# If not, update:
curl -X POST http://localhost:8000/api/consignments/1/update_status/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Tracking Map Not Displaying

**Possible Causes**:
1. Shipment has no location data
2. Coordinates are invalid (out of range)
3. LocationMap component not receiving shipment prop

**Solution**:
```bash
# Verify location data exists
curl -X GET http://localhost:8000/api/shipments/1/tracking_data/ \
  -H "Authorization: Bearer {token}"

# If missing, add location:
curl -X POST http://localhost:8000/api/shipments/1/update_location/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "location_type": "current",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, USA",
    "city": "New York",
    "country": "USA"
  }'
```

### Permission Denied Error (403)

**Possible Causes**:
1. Non-admin user trying to create/delete consignment
2. User role not properly set in database

**Solution**:
```bash
# Verify user role
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer {token}"

# Response should show "role": "admin"
# If not, update in Django admin or run:
# python manage.py shell
# User.objects.filter(email='admin@test.com').update(role='admin')
```

### Database Table Missing

**Error**: `sqlite3.OperationalError: no such table: notifications`

**Solution**:
```bash
# Run migrations
cd backend
python manage.py migrate

# Create test data
python manage.py create_test_data
```

---

## Best Practices

### For Admins

✅ **DO**:
- Create consignments with accurate declared values
- Update shipment status regularly as item moves
- Add location data at least every 4 hours during transit
- Review client feedback and complaints promptly
- Maintain accurate storage location records

❌ **DON'T**:
- Create duplicate consignments
- Update status backwards (e.g., from "delivered" to "in_transit")
- Leave shipments in "preparing" status indefinitely
- Delete consignments with active shipments
- Share admin credentials

### For Data Quality

- Always verify weight and purity before setting status to "approved"
- Use consistent address formatting for locations
- Include specific coordinates (not just city names)
- Document any special handling requirements
- Keep audit trail of all status changes

### For Security

- Change default admin password after first login
- Use HTTPS in production
- Implement IP whitelisting for admin access
- Enable 2FA if available
- Rotate API tokens regularly
- Never log credentials in code

---

## Support & Contact

For issues or questions:
1. Check logs: `backend/logs/django.log`
2. Run diagnostic: `python manage.py check`
3. Verify database: `python manage.py dbshell`
4. Contact development team with error message and step-by-step reproduction

