# Backend Custody Management Requirements

## Overview
The frontend CustodyPage needs specific API endpoints and functionality to manage custody chains for gold consignments. This document outlines what the backend must implement.

---

## Required API Endpoints

### 1. GET `/api/custody/records/` 
**Purpose:** Fetch all custody records for display in the custody chain timeline

**Required Functionality:**
- Return list of all CustodyRecord objects
- Include related data (custodian names, consignment info)
- Filter by current admin's access level

**Expected Response:**
```json
[
  {
    "id": 1,
    "consignment_id": 123,
    "consignment_number": "KSL-2026-123456",
    "consignment_item_name": "Gold Bars 500g",
    "previous_custodian": 5,
    "previous_custodian_name": "John Smith",
    "new_custodian": 6,
    "new_custodian_name": "Jane Doe",
    "previous_location": "Secure Storage",
    "new_location": "Transit Center A",
    "transfer_date": "2026-01-15T10:30:00Z",
    "notes": "Item ready for shipment",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

**Authentication:** Required (Bearer token)
**Permissions:** Admin only

---

### 2. POST `/api/custody/transfer/`
**Purpose:** Record a new custody transfer

**Required Functionality:**
- Accept custody transfer data
- Validate consignment exists
- Validate custodian exists
- Create new CustodyRecord
- Update consignment's current_location
- Log audit trail

**Expected Request Body:**
```json
{
  "consignment_id": 123,
  "new_custodian": 6,
  "new_location": "Transit Center B",
  "notes": "Optional notes about the transfer"
}
```

**Expected Response:**
```json
{
  "id": 2,
  "consignment_id": 123,
  "previous_custodian": 5,
  "new_custodian": 6,
  "previous_location": "Secure Storage",
  "new_location": "Transit Center B",
  "transfer_date": "2026-01-15T11:00:00Z",
  "notes": "Optional notes about the transfer",
  "created_at": "2026-01-15T11:00:00Z",
  "message": "Custody transfer recorded successfully"
}
```

**Validation:**
- ✅ Consignment must exist
- ✅ New custodian (Staff) must exist
- ✅ New location must be provided
- ✅ Notes are optional

**Side Effects:**
- Create CustodyRecord
- Update Consignment.current_location
- Create audit log entry

**Authentication:** Required (Bearer token)
**Permissions:** Admin/Staff with custody permissions

---

## Required Serializer Updates

### CustodyRecordSerializer
Add these fields to properly return custody chain data:

```python
class CustodyRecordSerializer(serializers.ModelSerializer):
    # Related data - names instead of IDs
    previous_custodian_name = serializers.CharField(
        source='previous_custodian.user.get_full_name',
        read_only=True
    )
    new_custodian_name = serializers.CharField(
        source='new_custodian.user.get_full_name',
        read_only=True
    )
    
    # Consignment details
    consignment_number = serializers.CharField(
        source='consignment.consignment_number',
        read_only=True
    )
    consignment_item_name = serializers.CharField(
        source='consignment.item_name',
        read_only=True
    )
    
    class Meta:
        model = CustodyRecord
        fields = [
            'id',
            'consignment',
            'consignment_id',
            'consignment_number',
            'consignment_item_name',
            'previous_custodian',
            'previous_custodian_name',
            'new_custodian',
            'new_custodian_name',
            'previous_location',
            'new_location',
            'transfer_date',
            'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'transfer_date', 'created_at']
```

---

## Required ViewSet Updates

### CustodyRecordViewSet
Enhance with custom actions:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import CustodyRecord
from .serializers import CustodyRecordSerializer
from apps.consignments.models import Consignment
from apps.staff.models import Staff

class CustodyRecordViewSet(viewsets.ModelViewSet):
    queryset = CustodyRecord.objects.all()
    serializer_class = CustodyRecordSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        """Return custody records ordered by creation date (newest first)"""
        return CustodyRecord.objects.all().order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def transfer(self, request):
        """
        Record a new custody transfer.
        
        Expected body:
        {
            "consignment_id": 123,
            "new_custodian": 6,
            "new_location": "Transit Center B",
            "notes": "Optional notes"
        }
        """
        try:
            consignment_id = request.data.get('consignment_id')
            new_custodian_id = request.data.get('new_custodian')
            new_location = request.data.get('new_location')
            notes = request.data.get('notes', '')
            
            # Validate required fields
            if not all([consignment_id, new_custodian_id, new_location]):
                return Response(
                    {'error': 'consignment_id, new_custodian, and new_location are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get consignment
            try:
                consignment = Consignment.objects.get(id=consignment_id)
            except Consignment.DoesNotExist:
                return Response(
                    {'error': 'Consignment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get new custodian (Staff)
            try:
                new_custodian = Staff.objects.get(id=new_custodian_id)
            except Staff.DoesNotExist:
                return Response(
                    {'error': 'Staff member not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get previous custodian from last custody record
            previous_record = CustodyRecord.objects.filter(
                consignment=consignment
            ).order_by('-created_at').first()
            
            previous_custodian = previous_record.new_custodian if previous_record else None
            previous_location = previous_record.new_location if previous_record else consignment.current_location
            
            # Create new custody record
            custody_record = CustodyRecord.objects.create(
                consignment=consignment,
                previous_custodian=previous_custodian,
                new_custodian=new_custodian,
                previous_location=previous_location,
                new_location=new_location,
                notes=notes
            )
            
            # Update consignment current location
            consignment.current_location = new_location
            consignment.save()
            
            # Create audit log
            from apps.audit.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='custody_transfer',
                object_type='CustodyRecord',
                object_id=custody_record.id,
                details=f'Transferred {consignment.item_name} from {previous_location} to {new_location}'
            )
            
            serializer = CustodyRecordSerializer(custody_record)
            return Response(
                {**serializer.data, 'message': 'Custody transfer recorded successfully'},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_consignment(self, request):
        """Get custody records for a specific consignment"""
        consignment_id = request.query_params.get('consignment_id')
        
        if not consignment_id:
            return Response(
                {'error': 'consignment_id query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = CustodyRecord.objects.filter(
            consignment_id=consignment_id
        ).order_by('created_at')
        
        serializer = CustodyRecordSerializer(records, many=True)
        return Response(serializer.data)
```

---

## Required URL Configuration

Update `backend/apps/custody/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'records', views.CustodyRecordViewSet, basename='custody-record')

urlpatterns = [
    path('', include(router.urls)),
]
```

This creates:
- `GET /api/custody/records/` - List all custody records
- `POST /api/custody/records/transfer/` - Record a new transfer
- `GET /api/custody/records/by_consignment/?consignment_id=123` - Get chain for one item

---

## Required Model Updates

Ensure `CustodyRecord` model has proper relationships:

```python
from django.db import models

class CustodyRecord(models.Model):
    consignment = models.ForeignKey(
        'consignments.Consignment',
        on_delete=models.CASCADE,
        related_name='custody_records'
    )
    previous_custodian = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custody_from'
    )
    new_custodian = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        related_name='custody_to'
    )
    previous_location = models.CharField(max_length=200, blank=True)
    new_location = models.CharField(max_length=200)
    transfer_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'custody_records'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Custody Transfer - {self.consignment.item_name} ({self.transfer_date})"
```

---

## Database Migrations

If model changes are made, run:

```bash
python manage.py makemigrations custody
python manage.py migrate custody
```

---

## Permissions Required

The endpoints need:
- **Admin users** - Full access (create, read, update transfers)
- **Staff users** - Can record transfers but may need restrictions
- **Clients** - No access to custody endpoints

---

## Testing Checklist

- ✅ GET /api/custody/records/ returns list of all transfers
- ✅ Response includes custodian names (not just IDs)
- ✅ Response includes consignment details
- ✅ POST /api/custody/transfer/ creates new record
- ✅ Transfer validates consignment exists
- ✅ Transfer validates custodian exists
- ✅ Transfer updates consignment.current_location
- ✅ Transfer creates audit log
- ✅ Custody chain can be viewed for single consignment
- ✅ Permissions work correctly (admin only)
- ✅ Authentication token required

---

## Integration Points

The custody system integrates with:

1. **Consignments** - Updates current_location on transfer
2. **Staff** - References custodians (staff members)
3. **Audit** - Logs all custody transfers
4. **Auth** - Requires admin permissions

---

## Example Usage Flow

1. **Admin opens Custody page**
   - Frontend calls `GET /api/custody/records/`
   - Backend returns all custody records
   - Timeline is displayed

2. **Admin records new transfer**
   - Frontend submits POST to `/api/custody/transfer/`
   - Backend validates data
   - Creates CustodyRecord
   - Updates Consignment location
   - Logs audit entry
   - Returns success response

3. **Frontend updates display**
   - New transfer appears in timeline
   - Stats update automatically

---

## Error Scenarios to Handle

```
400 - Bad Request
  - Missing required fields
  - Invalid consignment_id
  - Invalid new_custodian

403 - Forbidden
  - User not admin/staff

404 - Not Found
  - Consignment doesn't exist
  - Staff member doesn't exist

500 - Server Error
  - Database issues
  - Unexpected errors
```

---

## Summary

The backend needs to:

✅ **Endpoints:**
- GET /api/custody/records/ - List all transfers
- POST /api/custody/transfer/ - Record new transfer
- GET /api/custody/records/by_consignment/ - Get chain for one item

✅ **Features:**
- Return detailed custody chain data
- Include custodian and consignment names
- Update consignment location on transfer
- Create audit logs
- Validate all inputs

✅ **Security:**
- Require authentication
- Restrict to admin users
- Log all actions

**Once these are implemented, the frontend Custody page will be fully functional!**

