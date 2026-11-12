# Collection/Shipping Delivery Workflow Guide

## 📊 Workflow State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ASSET LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. INITIAL PROCESSING PHASE
   ├─ pending ──→ received ──→ under_verification ──→ verification_passed
   └─ (Old flow completes here)

2. APPROVAL PHASE  
   └─ verification_passed ──→ approved ──→ 🎯 APPROVED ✓

3. ⭐ NEW DELIVERY CHOICE PHASE ⭐
   ├─ APPROVED ──→ pending_delivery_choice
   │              ↓
   │      [USER CHOOSES METHOD]
   │      ├─────────────────────┐
   │      │                     │
   │   COLLECTION           SHIPPING
   │      │                     │
   └──→ collection_scheduled  shipping_scheduled
        │                     │
        ├─ ready_for_collection ─ ready_for_shipment
        │                     │
        ├─ collected ───────── shipped
        │                     │
        └─────────────→ delivered

4. COMPLETION PHASE
   └─ completed (when fully processed)
```

---

## 🎯 User Interaction Flow

### Collection Path
```
User sees "APPROVED ✓" badge on asset
                ↓
         [Next Step] button appears
                ↓
    User clicks button
                ↓
    Modal opens: "Choose Delivery Method"
                ↓
    User selects "Collection"
                ↓
    Modal shows:
    - Facility address
    - Operating hours (Mon-Fri 9-5, Sat 10-2)
    - Contact phone
    - Note: Call 24 hours in advance
    - Valid ID required
                ↓
    User clicks [Confirm Collection]
                ↓
    Asset status → collection_scheduled
    Modal closes
                ↓
    User sees status updated on dashboard
    Option to schedule appointment appears
```

### Shipping Path
```
User sees "APPROVED ✓" badge on asset
                ↓
         [Next Step] button appears
                ↓
    User clicks button
                ↓
    Modal opens: "Choose Delivery Method"
                ↓
    User selects "Shipping"
                ↓
    Modal shows form:
    - Shipping address (textarea)
    - Phone number
    - Preferred delivery date
    - Insurance coverage info
                ↓
    User enters details
                ↓
    User clicks [Confirm Shipping]
                ↓
    Asset status → shipping_scheduled
    Modal closes
                ↓
    Email sent with shipping confirmation
    Tracking info provided to user
```

---

## 🏠 Component Architecture

### CollectionShippingModal Component

**Props:**
```javascript
{
  isOpen: boolean,           // Modal visibility
  onClose: function,         // Close handler
  asset: object,             // Asset details
  onConfirm: function        // Confirmation handler
}
```

**State Management:**
```javascript
- deliveryMethod: 'collection' | 'shipping' | null
- step: 1 (choose) | 2 (confirm)
```

**Event Handlers:**
```javascript
handleMethodSelect(method)      // Choose collection/shipping
handleBack()                    // Return to method selection
handleConfirm()                 // Confirm and close modal
```

---

## 📊 Status Colors & Badges

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| `approved` | Emerald | #10b981 | Asset cleared, ready for next step |
| `pending_delivery_choice` | Blue | #3b82f6 | Awaiting user selection |
| `collection_scheduled` | Purple | #a855f7 | Collection appointment booked |
| `ready_for_collection` | Purple | #d946ef | Items prepared for pickup |
| `collected` | Green | #22c55e | Client picked up items |
| `shipping_scheduled` | Orange | #f97316 | Shipping details confirmed |
| `ready_for_shipment` | Orange | #fb923c | Items prepared to ship |
| `shipped` | Amber | #fbbf24 | In transit to client |
| `delivered` | Green | #16a34a | Delivery complete |

---

## 💾 Database Schema (Recommended)

### Asset Delivery Preferences Table
```sql
CREATE TABLE asset_deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  delivery_method ENUM('collection', 'shipping') NOT NULL,
  delivery_status VARCHAR(50) NOT NULL,
  
  -- For Collection
  collection_date DATETIME NULL,
  collection_staff_id INT NULL,
  
  -- For Shipping
  shipping_address VARCHAR(500) NULL,
  shipping_phone VARCHAR(20) NULL,
  preferred_delivery_date DATE NULL,
  tracking_number VARCHAR(100) NULL,
  shipping_cost DECIMAL(10, 2) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (collection_staff_id) REFERENCES staff(id)
);
```

---

## 🔄 API Endpoints (To be implemented)

### 1. Get Asset Delivery Status
```
GET /api/assets/{assetId}/delivery-status

Response:
{
  assetId: 123,
  status: 'collection_scheduled',
  method: 'collection',
  details: {
    collectionDate: '2024-02-15T10:00:00',
    location: 'The Vault',
    contact: '+1 (555) 123-4567'
  }
}
```

### 2. Update Delivery Method
```
POST /api/assets/{assetId}/delivery-method

Request Body:
{
  method: 'collection' | 'shipping',
  shippingAddress?: string,
  shippingPhone?: string,
  preferredDeliveryDate?: date
}

Response:
{
  success: true,
  newStatus: 'collection_scheduled',
  message: 'Delivery method confirmed'
}
```

### 3. Schedule Collection
```
POST /api/assets/{assetId}/schedule-collection

Request Body:
{
  appointmentDate: date,
  appointmentTime: time,
  staffId: number
}

Response:
{
  success: true,
  confirmationNumber: 'COL-2024-001234',
  appointmentDetails: {...}
}
```

### 4. Initiate Shipping
```
POST /api/assets/{assetId}/initiate-shipping

Request Body:
{
  shippingAddress: string,
  phone: string,
  insuranceOption: 'basic' | 'premium'
}

Response:
{
  success: true,
  trackingNumber: 'TRK123456789',
  estimatedDelivery: date,
  insuranceCost: 150.00
}
```

---

## 📧 Email Notifications

### Collection Confirmation Email
```
Subject: Collection Appointment Confirmed - Asset KSL-2024-005

Dear [Client Name],

Your asset "Krugerrand 1oz Gold Coin" has been cleared and is ready for collection.

📍 Collection Details:
Location: Kestrel Security Vault
Address: 123 Security Lane, Premium District
Hours: Monday - Friday: 9:00 AM - 5:00 PM
       Saturday: 10:00 AM - 2:00 PM

Appointment Scheduled: [Date & Time]

Please bring valid government-issued ID for identification purposes.

Questions? Contact us: +1 (555) 123-4567

Best regards,
Kestrel Security Team
```

### Shipping Confirmation Email
```
Subject: Shipping Initiated - Tracking #TRK123456789

Dear [Client Name],

Your asset "Britannia 2026 1oz Gold Bullion Coin" has been cleared and is 
ready to ship to your address.

📦 Shipping Details:
Tracking Number: TRK123456789
Destination: [Address]
Estimated Delivery: [Date]
Insurance: Full Coverage Included
Cost: $[Amount]

Track your shipment: [Tracking URL]

Your asset is fully insured during transit. You'll receive delivery updates 
via email and SMS.

Best regards,
Kestrel Security Team
```

---

## 🔐 Security Considerations

### Collection
- ✅ Valid ID verification required
- ✅ Staff sign-off on handover
- ✅ Audit log entry created
- ✅ Receipt email sent
- ✅ Chain of custody documented

### Shipping
- ✅ Full insurance coverage mandatory
- ✅ Sealed box with tracking number
- ✅ Signature required on delivery
- ✅ Photo proof of delivery
- ✅ Email confirmation to client

---

## 📱 Mobile Optimization Notes

### Collection Modal (Mobile View)
```
┌─────────────────────┐
│ ✓ Cleared Success! │
├─────────────────────┤
│ Choose Method      │
├─────────────────────┤
│ [Collection Card]  │
│ Full Width         │
│                    │
│ [Shipping Card]    │
│ Full Width         │
├─────────────────────┤
│ [Cancel] [Next]   │
└─────────────────────┘
```

### Collection Details (Mobile View)
```
┌─────────────────────┐
│ Facility Details   │
├─────────────────────┤
│ 📍 Address Text    │
│ 🕒 Hours Text     │
│ 📞 Phone Number   │
│ ℹ️ Note Text      │
├─────────────────────┤
│ Asset Summary      │
├─────────────────────┤
│ [Cancel] [Confirm] │
└─────────────────────┘
```

---

## ✅ Validation Checklist

- [ ] Asset has 'approved' status
- [ ] User has paid all pending fees
- [ ] Storage location is verified
- [ ] No holds or disputes on asset
- [ ] Client address confirmed (if shipping)
- [ ] Phone number provided for contact
- [ ] Insurance options accepted (if shipping)
- [ ] Terms and conditions acknowledged

---

## 🎓 Testing Scenarios

### Scenario 1: Collection Happy Path
1. Admin approves asset
2. Client sees "Next Step" button
3. Client clicks button
4. Collection modal opens
5. Client selects "Collection"
6. Client reviews facility details
7. Client clicks "Confirm Collection"
8. Status updates to `collection_scheduled`
9. Confirmation email sent

### Scenario 2: Shipping Happy Path
1. Admin approves asset
2. Client sees "Next Step" button
3. Client clicks button
4. Shipping modal opens
5. Client selects "Shipping"
6. Client enters address, phone, date
7. Client reviews insurance info
8. Client clicks "Confirm Shipping"
9. Status updates to `shipping_scheduled`
10. Tracking number generated
11. Confirmation email with tracking sent

### Scenario 3: Modal Close Without Selection
1. Modal opens
2. Client clicks "Cancel"
3. Modal closes
4. Asset status remains 'approved'
5. "Next Step" button still visible

---

## 🚀 Rollout Plan

### Phase 1: Internal Testing
- QA team tests both workflows
- Admin users test delivery management
- Verify email notifications work

### Phase 2: Beta Launch
- Limited users (10-20 clients)
- Monitor for issues
- Gather feedback

### Phase 3: Full Rollout
- Enable for all users
- Monitor performance
- Gather analytics

### Phase 4: Optimization
- A/B test messaging
- Optimize conversion rate
- Add advanced features

---

## 📊 Success Metrics

- **Delivery Choice Completion Rate** - % of approved assets where user selects delivery method
- **Collection vs Shipping Split** - Ratio of users choosing each option
- **Average Response Time** - Time from approval to delivery choice
- **Error Rate** - Failed deliveries or issues
- **Customer Satisfaction** - Post-delivery feedback score

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Check `showDeliveryModal` state, verify asset.status === 'approved' |
| Status not updating | Verify `handleDeliveryConfirm()` is called, check state mutation |
| Email not sending | Check email service configuration, verify phone/address fields |
| Images not loading | Check local image paths, verify fallback gradients working |
| Mobile layout broken | Check responsive classes, verify Tailwind compiled properly |

---

**This workflow is now ready for backend integration and testing!** 🎉
