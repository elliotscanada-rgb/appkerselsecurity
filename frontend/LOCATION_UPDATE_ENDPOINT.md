# Location Update Endpoint Specification

## Overview
The location update endpoint enables admin officers to record real-time location updates for assets during transit. This is the core functionality of the asset tracking system.

---

## Endpoint: POST /locations/asset/:assetId

Update the location of an asset during shipment.

### Authentication
- **Required**: Yes (Bearer Token)
- **Roles**: admin, officer

### Request

**URL Parameters:**
- `assetId` (string) - Unique asset identifier (e.g., "VA-2026-00125")

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shipment_id": 1,
  "location_type": "IN_TRANSIT",
  "location_name": "Mombasa Port",
  "city": "Mombasa",
  "country": "Kenya",
  "port_airport": "KMBT",
  "coordinates_lat": -4.0383,
  "coordinates_lng": 39.6682,
  "status": "IN_TRANSIT",
  "description": "Asset arrived at Mombasa Port for customs clearance",
  "evidence_photo_url": "https://..."
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| shipment_id | integer | Yes | ID of the shipment containing this asset |
| location_type | string | Yes | Type of location: ORIGIN, IN_TRANSIT, PORT, CUSTOMS, WAREHOUSE, DESTINATION |
| location_name | string | Yes | Human-readable location name |
| city | string | Yes | City name |
| country | string | Yes | Country name |
| port_airport | string | No | Port code or airport code |
| coordinates_lat | decimal | Yes | Latitude in WGS84 format |
| coordinates_lng | decimal | Yes | Longitude in WGS84 format |
| status | string | Yes | Current status: IN_TRANSIT, CUSTOMS, STORAGE, DELIVERED |
| description | string | No | Additional notes about the location update |
| evidence_photo_url | string | No | URL to uploaded evidence photo |

### Response

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 2,
    "asset_id": 1,
    "asset_ref": "VA-2026-00125",
    "shipment_id": 1,
    "location_type": "IN_TRANSIT",
    "location_name": "Mombasa Port",
    "city": "Mombasa",
    "country": "Kenya",
    "port_airport": "KMBT",
    "coordinates": {
      "lat": -4.0383,
      "lng": 39.6682
    },
    "status": "IN_TRANSIT",
    "description": "Asset arrived at Mombasa Port for customs clearance",
    "evidence_photo_url": "https://...",
    "updated_by": {
      "user_id": "OFF-001",
      "name": "Christina Kamberina"
    },
    "created_at": "2026-05-13T08:20:00Z",
    "updated_at": "2026-05-13T08:20:00Z"
  }
}
```

### Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Missing required fields: coordinates_lat, coordinates_lng"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired authentication token"
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You do not have permission to update locations"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Asset 'VA-2026-00125' not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "An error occurred while updating location"
}
```

---

## Related Endpoints

### GET /locations/asset/:assetId
Get complete location history for an asset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "location_type": "ORIGIN",
      "location_name": "Nairobi Warehouse",
      "coordinates": {"lat": -1.2762, "lng": 36.8172},
      "status": "ORIGIN",
      "created_at": "2026-05-10T10:30:00Z"
    },
    {
      "id": 2,
      "location_type": "IN_TRANSIT",
      "location_name": "Mombasa Port",
      "coordinates": {"lat": -4.0383, "lng": 39.6682},
      "status": "IN_TRANSIT",
      "created_at": "2026-05-13T08:20:00Z"
    }
  ]
}
```

### GET /locations/asset/:assetId/current
Get current location of asset

**Response:**
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

### POST /locations/:locationId/photo
Upload evidence photo for location update

**Form Data:**
- `photo` (file) - Image file

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo_url": "https://..."
  }
}
```

---

## Usage Examples

### Example 1: Update Location via cURL
```bash
curl -X POST http://localhost:5000/api/locations/asset/VA-2026-00125 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "shipment_id": 1,
    "location_type": "IN_TRANSIT",
    "location_name": "Mombasa Port",
    "city": "Mombasa",
    "country": "Kenya",
    "port_airport": "KMBT",
    "coordinates_lat": -4.0383,
    "coordinates_lng": 39.6682,
    "status": "IN_TRANSIT",
    "description": "Asset at customs for inspection"
  }'
```

### Example 2: Update Location via JavaScript
```javascript
import { locationApi } from './services/assetApi';

const locationData = {
  shipment_id: 1,
  location_type: 'IN_TRANSIT',
  location_name: 'Mombasa Port',
  city: 'Mombasa',
  country: 'Kenya',
  port_airport: 'KMBT',
  coordinates_lat: -4.0383,
  coordinates_lng: 39.6682,
  status: 'IN_TRANSIT',
  description: 'Asset at customs for inspection'
};

try {
  const response = await locationApi.addLocation('VA-2026-00125', locationData);
  console.log('Location updated:', response.data);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

### Example 3: Update Location with Photo Upload
```javascript
// First update location
const response = await locationApi.addLocation('VA-2026-00125', locationData);
const locationId = response.data.id;

// Then upload photo
const photoFile = document.getElementById('photo-input').files[0];
await locationApi.uploadLocationPhoto(locationId, photoFile);
```

---

## Database Schema

### asset_locations Table
```sql
CREATE TABLE asset_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  shipment_id INT,
  location_type VARCHAR(50),
  location_name VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  port_airport VARCHAR(255),
  coordinates_lat DECIMAL(10,8),
  coordinates_lng DECIMAL(11,8),
  status VARCHAR(50),
  description TEXT,
  evidence_photo_url VARCHAR(500),
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (shipment_id) REFERENCES shipments(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_created_at (created_at)
);
```

---

## Implementation Notes

### Server-Side Implementation (Node.js/Express)

```javascript
// POST /locations/asset/:assetId
router.post('/locations/asset/:assetId', authMiddleware, async (req, res) => {
  try {
    const { assetId } = req.params;
    const {
      shipment_id,
      location_type,
      location_name,
      city,
      country,
      port_airport,
      coordinates_lat,
      coordinates_lng,
      status,
      description,
    } = req.body;

    // Validation
    if (!location_name || !city || !country || !coordinates_lat || !coordinates_lng) {
      return res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: 'Missing required fields',
      });
    }

    // Verify asset exists
    const asset = await db.query(
      'SELECT id FROM assets WHERE asset_id = ?',
      [assetId]
    );
    if (asset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Asset '${assetId}' not found`,
      });
    }

    // Insert location record
    const result = await db.query(
      `INSERT INTO asset_locations 
       (asset_id, shipment_id, location_type, location_name, city, country, 
        port_airport, coordinates_lat, coordinates_lng, status, description, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        asset[0].id,
        shipment_id,
        location_type,
        location_name,
        city,
        country,
        port_airport,
        coordinates_lat,
        coordinates_lng,
        status,
        description,
        req.user.id,
      ]
    );

    // Create audit log
    await db.query(
      `INSERT INTO audit_logs 
       (user_id, action, entity_type, entity_id, new_values)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        'LOCATION_UPDATE',
        'ASSET',
        asset[0].id,
        JSON.stringify({ location_name, city, country, status }),
      ]
    );

    // Send notification to customer
    await notificationService.notifyLocationUpdate(asset[0].id, {
      location: location_name,
      status,
      updated_by: req.user.full_name,
    });

    res.status(201).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        id: result.insertId,
        asset_id: asset[0].id,
        asset_ref: assetId,
        location_type,
        location_name,
        city,
        country,
        coordinates: { lat: coordinates_lat, lng: coordinates_lng },
        status,
        updated_by: {
          user_id: req.user.user_id,
          name: req.user.full_name,
        },
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while updating location',
    });
  }
});
```

### Frontend Integration

```javascript
// LocationUpdateModal component handles the UI
// Calls locationApi.addLocation() with form data
// Handles photo upload with locationApi.uploadLocationPhoto()
// Shows success/error messages to user
```

---

## Security Considerations

1. **Authentication**: All requests must include valid JWT token
2. **Authorization**: Only admin and officer roles can create location updates
3. **Validation**: All coordinates must be valid WGS84 format
4. **Audit Trail**: All location updates are logged for compliance
5. **Photo Upload**: 
   - Limited to 10MB file size
   - Only image formats allowed (JPG, PNG, WebP)
   - Files stored in secure cloud storage with signed URLs
6. **Rate Limiting**: Maximum 1000 location updates per hour per user

---

## Performance Optimization

1. **Indexing**: asset_id and created_at are indexed for fast queries
2. **Caching**: Current location cached for 5 minutes
3. **Batch Updates**: Support for bulk location updates (Phase 2)
4. **Pagination**: History paginated to prevent large responses

---

## Testing

### Unit Test Example
```javascript
describe('Location Update Endpoint', () => {
  it('should update asset location successfully', async () => {
    const response = await request(app)
      .post('/api/locations/asset/VA-2026-00125')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shipment_id: 1,
        location_type: 'IN_TRANSIT',
        location_name: 'Mombasa Port',
        city: 'Mombasa',
        country: 'Kenya',
        coordinates_lat: -4.0383,
        coordinates_lng: 39.6682,
        status: 'IN_TRANSIT',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.location_name).toBe('Mombasa Port');
  });
});
```

---

## Webhooks (Phase 2)

Location updates can trigger webhooks to notify external systems:

```json
{
  "event": "asset.location_updated",
  "timestamp": "2026-05-13T08:20:00Z",
  "data": {
    "asset_id": "VA-2026-00125",
    "location": "Mombasa Port",
    "coordinates": {"lat": -4.0383, "lng": 39.6682},
    "status": "IN_TRANSIT"
  }
}
```

---

**Version**: 1.0  
**Last Updated**: November 10, 2026  
**Status**: Ready for Implementation
