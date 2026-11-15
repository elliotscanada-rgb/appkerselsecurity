# New Features: Client Documents, Safekeeping Fee & Gold Portfolio

## Summary
Implemented three new features as requested:
1. **Admin can upload documents directly to clients** (not just consignments)
2. **Safekeeping fee** added as a new charge type
3. **Portfolio gold weight display** on client dashboard

## Feature 1: Client Document Uploads ✅

### What Changed
Admins can now upload documents to:
- **Consignments** (existing functionality)
- **Clients directly** (NEW)

### Implementation

**DocumentUploadModal** - Updated to support both:
```javascript
// Upload to consignment
<DocumentUploadModal
  isOpen={true}
  onClose={closeHandler}
  consignmentId={123}
  onUploadSuccess={refreshDocs}
/>

// Upload to client (NEW)
<DocumentUploadModal
  isOpen={true}
  onClose={closeHandler}
  clientId={456}
  onUploadSuccess={refreshDocs}
/>
```

### New Document Types Added
- `identification` - ID Document
- `proof_of_ownership` - Proof of Ownership
- (Plus existing: invoice, receipt, contract, certificate, appraisal, insurance, customs, other)

### API Methods Added
```javascript
// Get documents for a specific client
const clientDocs = await documentApi.getClientDocuments(clientId);

// Upload document for client
const formData = new FormData();
formData.append('client', clientId);
formData.append('document_type', 'identification');
formData.append('description', 'Passport copy');
formData.append('file', fileObject);

const result = await documentApi.uploadClientDocument(formData);
```

### Backend Endpoint Expected
```
POST /api/documents/
Content-Type: multipart/form-data

FormData fields:
- client: <client_id>           (NEW - instead of consignment)
- document_type: <type>
- description: <description>
- file: <file_object>

GET /api/documents/by-client/{client_id}/  (NEW endpoint needed)
```

### Usage Example: ClientsPage
```javascript
import DocumentUploadModal from '../../components/common/DocumentUploadModal';

const ClientsPage = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // In client table/list
  <button
    onClick={() => {
      setSelectedClientId(client.id);
      setUploadModalOpen(true);
    }}
    className="text-cyan-400 hover:text-cyan-300"
  >
    <FaFileUpload /> Upload Document
  </button>

  // Modal
  <DocumentUploadModal
    isOpen={uploadModalOpen}
    onClose={() => setUploadModalOpen(false)}
    clientId={selectedClientId}
    onUploadSuccess={() => {
      alert('Document uploaded to client successfully!');
      fetchClientDocuments(selectedClientId);
    }}
  />
};
```

---

## Feature 2: Safekeeping Fee ✅

### What Changed
Added **"Safekeeping Fee"** as a new charge type option.

### Details
- **Code:** `safekeeping`
- **Name:** Safekeeping Fee
- **Description:** Fee for secure safekeeping and custody of valuable items
- **Calculation Method:** Per Day
- **Icon:** Shield (emerald color)
- **Use Case:** Charged for secure storage and custody of high-value items

### Where It Appears
1. **FeesConfigurationPage** - Now shows 9 charge types (was 8)
2. **Add Charge Dropdown** - Available when admins add fees to consignments
3. **Fee Breakdown** - Displays in client's consignment view

### How Admins Use It
1. Navigate to consignment detail page
2. Click "Add Charge" button
3. Select **"Safekeeping"** from charge type dropdown
4. Enter daily rate (e.g., $10/day)
5. Specify number of days (e.g., 30 days)
6. Add description: "30 days secure safekeeping"
7. System calculates: 30 days × $10 = $300
8. Save charge

### Charge Types (Complete List)
1. Storage Fee (per day)
2. Handling Fee (flat rate)
3. Insurance Fee (percentage)
4. Transport Fee (flat rate)
5. Processing Fee (flat rate)
6. Demurrage Fee (per day)
7. **Safekeeping Fee (per day)** ⭐ NEW
8. Customs Fee (flat rate)
9. Valuation Fee (flat rate)

---

## Feature 3: Portfolio Gold Weight Display ✅

### What Changed
Client dashboard now prominently displays **total gold weight in kilograms (KG)**.

### Display Location
In the dashboard stats banner, between "Total Value" and "In Storage":

```
┌─────────────┬──────────────┬──────────────────┬─────────────┬──────────┐
│Total Assets │ Total Value  │  Gold Portfolio  │ In Storage  │ Pending  │
│     12      │  $1,250,000  │    15.750 KG    │      8      │    2     │
│             │              │   12 items       │             │          │
└─────────────┴──────────────┴──────────────────┴─────────────┴──────────┘
```

### Visual Design
- **Background:** Golden gradient (yellow-900/40 to amber-900/40)
- **Border:** Golden border (yellow-600/50)
- **Icon:** Gold coin icon (FaCoins)
- **Text:** Yellow/amber colors
- **Size:** Slightly larger, spans 2 columns on mobile

### Data Source
**Priority:**
1. **From Portfolio API** - `clientApi.getClientPortfolio()`
   - Returns: `total_gold_weight_kg`, `gold_items_count`
2. **Calculated Fallback** - If API not available:
   - Filters consignments where `category === 'gold_bars' || 'gold_jewellery'`
   - Sums up `weight` field
   - Displays in KG with 3 decimal places

### API Method Added
```javascript
// Get current user's portfolio
const portfolio = await clientApi.getClientPortfolio();

// Response expected:
{
  total_gold_weight_kg: 15.750,
  gold_items_count: 12,
  total_value: 1250000,
  // ... other stats
}
```

### Backend Endpoint Needed
```
GET /api/clients/me/portfolio/

Response:
{
  "total_gold_weight_kg": 15.750,
  "gold_items_count": 12,
  "total_value": 1250000.00,
  "total_consignments": 15,
  "in_storage_count": 8,
  "pending_count": 2
}
```

### Implementation Details
- Auto-refreshes every 10 seconds (along with consignments)
- Shows loading spinner while fetching
- Falls back to calculated value if API fails
- Displays item count below weight
- Responsive: 1 column on small screens, spans 2 on mobile landscape

---

## Files Modified

### 1. `frontend/src/pages/admin/FeesConfigurationPage.jsx`
- Added safekeeping fee to charge types list
- Added emerald color to color classes
- Now displays 9 charge types

### 2. `frontend/src/components/common/DocumentUploadModal.jsx`
- Added `clientId` prop (optional, mutually exclusive with consignmentId)
- Added new document types: identification, proof_of_ownership
- Updated validation to accept either consignmentId OR clientId
- Updated upload logic to call appropriate API method
- Updated display to show "Client ID" or "Consignment ID" dynamically

### 3. `frontend/src/services/assetApi.js`
- Added `documentApi.getClientDocuments(clientId)`
- Added `documentApi.uploadClientDocument(formData)`
- Added `clientApi.getClientPortfolio(clientId)`

### 4. `frontend/src/pages/client/ClientDashboard.jsx`
- Added portfolio state and loading state
- Added portfolio fetch in useEffect
- Added gold portfolio card in stats grid
- Changed grid from 4 columns to 5 columns
- Integrated portfolio API with fallback calculation
- Added FaCoins import for gold icon

---

## Testing Checklist

### Client Documents:
- [ ] Admin can upload document to client profile
- [ ] Client ID is correctly attached to document
- [ ] New document types (identification, proof_of_ownership) work
- [ ] Documents appear in client's document list
- [ ] Upload modal shows "Client ID" when clientId is provided

### Safekeeping Fee:
- [ ] Safekeeping appears in FeesConfigurationPage (9th charge type)
- [ ] Safekeeping appears in "Add Charge" dropdown
- [ ] Per-day calculation works correctly
- [ ] Fee displays properly in consignment charges
- [ ] Client can see safekeeping fee in their dashboard

### Portfolio Gold Weight:
- [ ] Gold weight displays on client dashboard
- [ ] Shows correct total KG for client's gold items
- [ ] Updates automatically when consignments change
- [ ] Falls back to calculated value if API fails
- [ ] Shows item count below weight
- [ ] Visual styling (golden gradient) renders correctly
- [ ] Responsive on mobile devices

---

## Backend Implementation Needed

### 1. Client Document Upload Endpoint
**Required:** Backend needs to accept `client` field in document upload.

Currently supports:
```python
# In backend/apps/documents/serializers.py
consignment = serializers.PrimaryKeyRelatedField(...)
```

Needs to add:
```python
# Add optional client field
client = serializers.PrimaryKeyRelatedField(
    queryset=Client.objects.all(),
    required=False,
    allow_null=True
)

# Validation: require either consignment OR client
def validate(self, attrs):
    consignment = attrs.get('consignment')
    client = attrs.get('client')
    
    if not consignment and not client:
        raise serializers.ValidationError("Either consignment or client is required")
    
    if consignment and client:
        raise serializers.ValidationError("Provide either consignment or client, not both")
    
    return attrs
```

### 2. Client Documents List Endpoint
**Required:** New endpoint to get documents by client.

```python
# In backend/apps/documents/views.py

@action(detail=False, methods=['get'], url_path='by-client/(?P<client_id>[^/.]+)')
def by_client(self, request, client_id=None):
    """Get documents for a specific client"""
    documents = Document.objects.filter(client_id=client_id).order_by('-uploaded_at')
    serializer = self.get_serializer(documents, many=True)
    return Response(serializer.data)
```

### 3. Portfolio Stats Endpoint
**Required:** Endpoint to calculate client's gold portfolio stats.

```python
# In backend/apps/clients/views.py

@action(detail=False, methods=['get'], url_path='me/portfolio')
def portfolio(self, request):
    """Get current user's portfolio statistics"""
    client = request.user.client_profile
    
    # Get all consignments for this client
    consignments = Consignment.objects.filter(client=client)
    
    # Calculate gold weight (filter gold_bars and gold_jewellery)
    gold_items = consignments.filter(
        category__in=['gold_bars', 'gold_jewellery']
    )
    
    total_gold_weight_kg = gold_items.aggregate(
        total=Sum('weight')
    )['total'] or 0
    
    return Response({
        'total_gold_weight_kg': float(total_gold_weight_kg),
        'gold_items_count': gold_items.count(),
        'total_value': float(consignments.aggregate(Sum('declared_value'))['declared_value__sum'] or 0),
        'total_consignments': consignments.count(),
        'in_storage_count': consignments.filter(status='in_secure_storage').count(),
        'pending_count': consignments.filter(status__in=['pending', 'under_verification']).count(),
    })
```

---

## Deployment Steps

1. **Backend Changes Required:**
   ```bash
   cd backend
   
   # Add client field to Document model (if not exists)
   # Update DocumentSerializer to accept client field
   # Add by-client endpoint to DocumentViewSet
   # Add portfolio endpoint to ClientViewSet
   
   python manage.py makemigrations
   python manage.py migrate
   
   # Commit and push
   git add apps/documents apps/clients
   git commit -m "Add client documents and portfolio endpoints"
   git push origin master
   ```

2. **Frontend Deployment:**
   ```bash
   cd frontend
   npm run build
   # Upload dist/ folder
   ```

3. **Test Integration:**
   - Test client document upload
   - Test portfolio stats display
   - Test safekeeping fee addition

---

## Summary of Changes

✅ **Safekeeping Fee** - Ready to use immediately (frontend + backend)
✅ **Client Documents** - Frontend ready, backend needs client field support
✅ **Portfolio Gold Weight** - Frontend ready, backend needs portfolio endpoint

**Frontend:** COMPLETE
**Backend:** Needs 2 new endpoints + 1 field update

---

**Created:** January 2027  
**Status:** Frontend Complete, Backend Updates Required
