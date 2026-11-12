# API Specification - Asset Tracking & Shipment Management

**Version**: 1.0  
**Base URL**: `http://localhost:5000/api` (development) / `https://api.kestrel.com/api` (production)  
**Authentication**: Bearer Token (JWT)

---

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Login Endpoint
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "user_id": "OFF-001",
    "email": "user@example.com",
    "role": "admin",
    "full_name": "John Doe"
  }
}
```

---

## Asset Endpoints

### GET /assets
Get all assets with optional filters

**Query Parameters:**
- `status` - Filter by asset status (PENDING, REGISTERED, CLEARED, IN_TRANSIT, DELIVERED)
- `consignmentId` - Filter by consignment
- `customerId` - Filter by customer
- `depositYear` - Filter by deposit year
- `page` - Pagination page (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - Sort order (asc/desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_id": "VA-2026-00125",
      "asset_name": "Gold Bullion – 24K",
      "asset_category": "Gold",
      "consignment_id": 1,
      "declared_value": 25000,
      "insured_value": 25500,
      "currency": "USD",
      "weight": 5,
      "weight_unit": "kg",
      "purity": "99.9%",
      "photograph_url": "https://...",
      "asset_status": "IN_TRANSIT",
      "deposit_date": "2026-05-10T10:30:00Z",
      "deposit_year": 2026,
      "current_location": "Mombasa Port, Kenya",
      "last_location_update": "2026-05-13T08:20:00Z",
      "created_at": "2026-05-10T10:30:00Z",
      "updated_at": "2026-05-13T08:20:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### GET /assets/:assetId
Get single asset details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "asset_id": "VA-2026-00125",
    "asset_name": "Gold Bullion – 24K",
    "asset_category": "Gold",
    "consignment_id": 1,
    "declared_value": 25000,
    "insured_value": 25500,
    "weight": 5,
    "weight_unit": "kg",
    "purity": "99.9%",
    "serial_number": "GB-2026-0125",
    "photograph_url": "https://...",
    "certificate_number": "CERT-2026-00125",
    "insurance_policy_number": "POL-2026-00125",
    "security_seal_number": "SEAL-2026-00125",
    "asset_status": "IN_TRANSIT",
    "custody_status": "In Transit",
    "deposit_date": "2026-05-10T10:30:00Z",
    "created_by": 1,
    "asset_locations": [
      {
        "id": 1,
        "location_name": "Nairobi Warehouse",
        "location_type": "ORIGIN",
        "coordinates": {"lat": -1.2762, "lng": 36.8172},
        "status": "ORIGIN",
        "created_at": "2026-05-10T10:30:00Z"
      }
    ]
  }
}
```

### POST /assets
Create new asset

**Request Body:**
```json
{
  "consignment_id": 1,
  "asset_name": "Gold Bullion – 24K",
  "asset_category": "Gold",
  "asset_type": "Bullion",
  "description": "1kg gold bullion bar",
  "quantity": 1,
  "weight": 5,
  "weight_unit": "kg",
  "purity": "99.9%",
  "declared_value": 25000,
  "insured_value": 25500,
  "certificate_number": "CERT-2026-00125",
  "insurance_policy_number": "POL-2026-00125"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "id": 1,
    "asset_id": "VA-2026-00125",
    "consignment_id": 1,
    "asset_name": "Gold Bullion – 24K"
  }
}
```

### PUT /assets/:assetId
Update asset

**Request Body:**
```json
{
  "asset_name": "Gold Bullion – 24K (Updated)",
  "weight": 5.2,
  "declared_value": 25500
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": { ... }
}
```

### PATCH /assets/:assetId/status
Update asset status

**Request Body:**
```json
{
  "status": "IN_TRANSIT",
  "notes": "Asset dispatched to Mombasa"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Asset status updated",
  "data": { ... }
}
```

### DELETE /assets/:assetId
Delete asset

**Response (200):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

### GET /assets/:assetId/valuation
Get asset valuation details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "asset_id": "VA-2026-00125",
    "declared_value": 25000,
    "insured_value": 25500,
    "certificate_status": "VERIFIED",
    "insurance_status": "ACTIVE",
    "security_seal_status": "ACTIVE",
    "valuation_date": "2026-05-10",
    "valuated_by": "John Smith"
  }
}
```

### POST /assets/:assetId/photo
Upload asset photo

**Form Data:**
- `photo` (file) - Image file (JPG, PNG, WebP)

**Response (200):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo_url": "https://..."
  }
}
```

### GET /assets/:assetId/history
Get asset history/timeline

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-05-13T08:20:00Z",
      "action": "LOCATION_UPDATE",
      "description": "Arrived at Mombasa Port",
      "performed_by": "Christina Kamberina",
      "details": {
        "location": "Mombasa Port, Kenya",
        "status": "IN_TRANSIT"
      }
    }
  ]
}
```

---

## Shipment Endpoints

### GET /shipments
Get all shipments

**Query Parameters:**
- `status` - Filter by status (PENDING, DISPATCHED, IN_TRANSIT, CUSTOMS, DELIVERED)
- `consignmentId` - Filter by consignment
- `assignedOfficerId` - Filter by officer
- `page` - Pagination page
- `limit` - Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shipment_id": "SH-2026-00125",
      "consignment_id": 1,
      "status": "IN_TRANSIT",
      "origin_location": "Nairobi, Kenya",
      "destination_location": "London, United Kingdom",
      "current_location": "Mombasa Port, Kenya",
      "assigned_officer_name": "Christina Kamberina",
      "transport_mode": "AIR",
      "container_number": "CNT-2026-00125",
      "estimated_arrival": "2026-05-20T18:00:00Z",
      "total_items": 5,
      "total_weight": 25.5,
      "created_at": "2026-05-10T10:30:00Z"
    }
  ]
}
```

### GET /shipments/:shipmentId
Get single shipment

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shipment_id": "SH-2026-00125",
    "consignment_id": 1,
    "shipment_type": "AIR",
    "status": "IN_TRANSIT",
    "origin_location": "Nairobi, Kenya",
    "destination_location": "London, United Kingdom",
    "origin_coordinates": {"lat": -1.2762, "lng": 36.8172},
    "destination_coordinates": {"lat": 51.5074, "lng": -0.1278},
    "current_location": "Mombasa Port, Kenya",
    "current_coordinates": {"lat": -4.0383, "lng": 39.6682},
    "assigned_officer_id": 1,
    "assigned_officer_name": "Christina Kamberina",
    "container_number": "CNT-2026-00125",
    "vehicle_number": "DL-4589",
    "transport_mode": "AIR",
    "estimated_departure": "2026-05-10T14:00:00Z",
    "actual_departure": "2026-05-10T15:30:00Z",
    "estimated_arrival": "2026-05-20T18:00:00Z",
    "total_weight": 25.5,
    "total_items": 5,
    "insurance_amount": 26000,
    "created_at": "2026-05-10T10:30:00Z"
  }
}
```

### POST /shipments
Create shipment

**Request Body:**
```json
{
  "consignment_id": 1,
  "shipment_type": "AIR",
  "origin_location": "Nairobi, Kenya",
  "destination_location": "London, United Kingdom",
  "origin_coordinates": {"lat": -1.2762, "lng": 36.8172},
  "destination_coordinates": {"lat": 51.5074, "lng": -0.1278},
  "transport_mode": "AIR",
  "container_number": "CNT-2026-00125",
  "vehicle_number": "DL-4589",
  "estimated_departure": "2026-05-10T14:00:00Z",
  "estimated_arrival": "2026-05-20T18:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "id": 1,
    "shipment_id": "SH-2026-00125"
  }
}
```

### PUT /shipments/:shipmentId
Update shipment

### PATCH /shipments/:shipmentId/status
Update shipment status

**Request Body:**
```json
{
  "status": "IN_TRANSIT"
}
```

### POST /shipments/:shipmentId/dispatch
Dispatch shipment

**Request Body:**
```json
{
  "dispatch_date": "2026-05-10T15:30:00Z",
  "notes": "Shipment dispatched from warehouse"
}
```

### GET /shipments/:shipmentId/tracking
Get shipment tracking information

**Response (200):**
```json
{
  "success": true,
  "data": {
    "shipment_id": "SH-2026-00125",
    "status": "IN_TRANSIT",
    "origin": "Nairobi, Kenya",
    "destination": "London, United Kingdom",
    "current_location": "Mombasa Port, Kenya",
    "progress_percentage": 65,
    "estimated_arrival": "2026-05-20T18:00:00Z",
    "route": {
      "coordinates": [
        {"lat": -1.2762, "lng": 36.8172},
        {"lat": -4.0383, "lng": 39.6682},
        {"lat": 51.5074, "lng": -0.1278}
      ]
    }
  }
}
```

### GET /shipments/:shipmentId/assets
Get assets in shipment

---

## Location Endpoints

### GET /locations/asset/:assetId
Get location history for asset

**Query Parameters:**
- `limit` - Number of records (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_id": "VA-2026-00125",
      "shipment_id": "SH-2026-00125",
      "location_type": "ORIGIN",
      "location_name": "Nairobi Warehouse",
      "city": "Nairobi",
      "country": "Kenya",
      "coordinates": {"lat": -1.2762, "lng": 36.8172},
      "status": "ORIGIN",
      "description": "Asset received at warehouse",
      "evidence_photo_url": "https://...",
      "updated_by": "John Smith",
      "created_at": "2026-05-10T10:30:00Z"
    },
    {
      "id": 2,
      "asset_id": "VA-2026-00125",
      "shipment_id": "SH-2026-00125",
      "location_type": "IN_TRANSIT",
      "location_name": "Mombasa Port",
      "city": "Mombasa",
      "country": "Kenya",
      "coordinates": {"lat": -4.0383, "lng": 39.6682},
      "status": "IN_TRANSIT",
      "description": "Asset loaded on aircraft",
      "updated_by": "Christina Kamberina",
      "created_at": "2026-05-13T08:20:00Z"
    }
  ]
}
```

### GET /locations/asset/:assetId/current
Get current location of asset

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "location_name": "Mombasa Port",
    "coordinates": {"lat": -4.0383, "lng": 39.6682},
    "status": "IN_TRANSIT",
    "updated_at": "2026-05-13T08:20:00Z",
    "updated_by": "Christina Kamberina"
  }
}
```

### POST /locations/asset/:assetId
Add new location update

**Request Body:**
```json
{
  "shipment_id": 1,
  "location_type": "IN_TRANSIT",
  "location_name": "Mombasa Port",
  "city": "Mombasa",
  "country": "Kenya",
  "coordinates": {"lat": -4.0383, "lng": 39.6682},
  "status": "IN_TRANSIT",
  "description": "Asset at Mombasa Port customs",
  "evidence_photo": "file"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 3,
    "location_name": "Mombasa Port"
  }
}
```

### PUT /locations/:locationId
Update location record

### POST /locations/:locationId/photo
Upload location evidence photo

**Form Data:**
- `photo` (file) - Evidence photo

### DELETE /locations/:locationId
Delete location record

---

## Custody Endpoints

### GET /custody/asset/:assetId
Get custody records for asset

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "custody_id": "CUS-2026-00125",
      "asset_id": 1,
      "transferred_from_name": "John Smith",
      "transferred_to_name": "Christina Kamberina",
      "transfer_location": "Nairobi Warehouse",
      "transfer_date": "2026-05-10T14:30:00Z",
      "seal_number": "SEAL-2026-00125",
      "seal_verified": true,
      "transfer_status": "SUCCESS"
    }
  ]
}
```

### POST /custody
Create custody transfer record

**Request Body:**
```json
{
  "asset_id": 1,
  "shipment_id": 1,
  "transferred_from_user_id": 1,
  "transferred_to_user_id": 2,
  "transfer_location": "Nairobi Warehouse",
  "seal_number": "SEAL-2026-00125",
  "transfer_date": "2026-05-10T14:30:00Z"
}
```

### POST /custody/:custodyId/verify-seal
Verify security seal

**Request Body:**
```json
{
  "seal_verified": true,
  "verification_date": "2026-05-10T15:00:00Z",
  "notes": "Seal verified intact"
}
```

### POST /custody/:custodyId/incident
Report custody incident

**Request Body:**
```json
{
  "incident_type": "SEAL_BROKEN",
  "incident_report": "Security seal found broken",
  "resolution_notes": "Seal replaced with new one"
}
```

---

## Search Endpoints

### GET /search/assets
Search assets

**Query Parameters:**
- `q` - Search query (searches name, ID, location)
- `status` - Filter by status
- `category` - Filter by category

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_id": "VA-2026-00125",
      "asset_name": "Gold Bullion – 24K",
      "match_type": "name",
      "relevance": 0.95
    }
  ]
}
```

### GET /search/advanced
Advanced search with multiple filters

**Query Parameters:**
- `assetName` - Asset name search
- `assetRef` - Asset reference
- `consignmentRef` - Consignment reference
- `status` - Asset status
- `location` - Current location
- `depositYearStart` - Deposit year range start
- `depositYearEnd` - Deposit year range end

---

## Statistics Endpoints

### GET /reports/dashboard-stats
Get dashboard statistics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_assets": 156,
    "total_shipments": 28,
    "total_value": 5250000,
    "active_shipments": 12,
    "pending_customs": 3,
    "delivered_today": 2,
    "assets_by_status": {
      "PENDING": 15,
      "IN_TRANSIT": 45,
      "DELIVERED": 96
    }
  }
}
```

### GET /reports/asset-stats
Get asset statistics

### GET /reports/shipment-stats
Get shipment statistics

### GET /reports/value-stats
Get value statistics by period

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly, yearly)

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Invalid request parameters"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required or invalid token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Insufficient permissions for this action"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "An error occurred on the server"
}
```

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Rate Limit Header**: `X-RateLimit-Remaining`
- **Retry-After**: `Retry-After` (in seconds)

---

## Environment Variables

```bash
# Frontend
VITE_API_URL=http://localhost:5000/api

# Backend
DATABASE_URL=mysql://user:password@localhost:3306/asset_tracking
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h
NODE_ENV=development
```

---

## Implementation Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Coordinates use WGS84 (latitude, longitude)
3. File uploads limited to 10MB
4. All API responses include `success` boolean flag
5. Pagination default limit: 20, max: 100
6. All monetary values in USD unless otherwise specified

---

**Last Updated**: November 10, 2026  
**API Version**: 1.0
