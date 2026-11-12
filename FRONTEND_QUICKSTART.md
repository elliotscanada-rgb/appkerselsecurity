# Frontend Quick Start Guide

## Building & Running the Frontend

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Port 5173 available (default Vite dev port)

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### Build for Production
```bash
npm run build
```
Output will be in `frontend/dist/`

---

## Testing the Application

### Demo Credentials
- **Default User**: Jack Daniels
- **Role**: Client
- **Auto-Login**: Click login with demo credentials

### Client Portal Flow

#### 1. Dashboard (http://localhost:5173/client/dashboard)
- View: "Your collection, organised." header
- See: Asset cards in grid layout
- Try: 
  - Click category filter to filter by asset type
  - Click sort dropdown to sort by date/value/name
  - Click "Details" on any asset for full specs
  - Click "History" on any asset for status timeline

#### 2. Asset Details Modal
- View: Complete asset information
- See: 
  - Asset specifications (metal, purity, weight, etc.)
  - Declared vs assessed value
  - Charges breakdown with paid/pending status
  - Current storage location

#### 3. Status History Modal
- View: Visual timeline of status changes
- See: All 13 statuses asset has gone through
- Check: Staff member responsible for each change
- Read: Status descriptions

#### 4. My Consignments (http://localhost:5173/client/consignments)
- View: List-based consignment view
- Try:
  - Search by consignment number or item name
  - Filter by status
  - Click "View Details" for full information
  - See charges breakdown table

### Admin Portal Flow

#### 1. Admin Dashboard (http://localhost:5173/admin/dashboard)
- View: Comprehensive overview with stats
- See: 
  - Total assets and value
  - Asset status distribution chart
  - Verification tracking
  - Financial overview (charges paid/pending)
  - All 13 statuses listed

#### 2. Consignments Management (http://localhost:5173/admin/consignments)
- View: Table of all consignments
- Try:
  - Search by consignment number, item, or client
  - Click coin icon to add charges
  - Click pencil icon to update status

#### 3. Add Consignment Modal
- Fill:
  - Client ID
  - Item Name
  - Category (Gold Bars, Diamonds, etc.)
  - Quantity, Weight, Purity
  - Declared Value
  - Current Location
  - Storage Unit
  - Status (select from 13 options)
  - Specifications (paste JSON)
- Submit: Creates new consignment

#### 4. Add Charge Modal
- Fill:
  - Charge Type (Storage, Transport, etc.)
  - Amount
  - Description
  - Status (Pending or Paid)
- Submit: Adds charge to consignment

---

## Testing Features

### Test 13-Status System
1. Go to admin consignments
2. Find "Britannia 2026 1oz Gold Bullion Coin"
3. Click History (pencil icon) or Details
4. In Details modal, you'll see:
   - Current status: "In Secure Storage"
   - All past statuses: Pending → Received → Under Verification → Verification Passed → Approved → In Secure Storage
5. Each status shows timestamp and staff member

### Test Asset Grid
1. Go to Client Dashboard
2. View 5 different assets in grid
3. Resize browser to test responsiveness:
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

### Test Currency (USD)
1. View any asset card or details modal
2. See: All values formatted as "$xxx,xxx.xx"
3. Check: Formatters applied consistently

### Test Filtering
1. On Client Dashboard
2. Select "Gold Coins & Bars" category
3. Should show: Britannia, Sovereign, Gold Bar, Krugerrand (4 assets)
4. Select "Diamonds & Jewelry"
5. Should show: Diamond Necklace (1 asset)

### Test Sorting
1. On Client Dashboard
2. Sort by "Most Recent"
3. Should show: Most recent at top (Krugerrand, Gold Bar, Diamond)
4. Sort by "Highest Value"
5. Should show: Diamond Necklace first ($295k)
6. Sort by "Name (A-Z)"
7. Should show: Alphabetical order

### Test Charges
1. On My Consignments page
2. Click "View Details" on any consignment
3. Scroll to "Charges Breakdown" section
4. See: 
   - Charge Type | Amount | Status
   - Storage | $5,000 | PAID
   - Verification | $1,500 | PAID
   - Insurance | $15,000 | PENDING
5. Total and Pending totals calculated

---

## Mock Data Overview

### Assets in System
| Name | Category | Quantity | Status | Value |
|------|----------|----------|--------|-------|
| Britannia 2026 | Coins | 5 | In Secure Storage | $128.5K |
| Sovereign 2025 | Coins | 10 | Approved | $71.5K |
| Gold Bar 100g | Bars | 2 | Under Verification | $138K |
| Diamond Necklace | Jewelry | 1 | Withdrawal Requested | $295K |
| Krugerrand 1oz | Coins | 8 | Approved | $176K |

### Storage Locations
- **The Vault** - Primary secure storage
- **Verification Center** - Authentication in progress
- **Processing Area** - Items awaiting approval
- **Transit Hub** - Items in transit

### Charge Types
- Storage Fee - Monthly vault storage
- Verification Fee - Authentication service
- Insurance - Coverage premium
- Handling - Initial processing
- Transportation - Shipping costs

---

## Color Scheme Reference

### Status Colors
- Pending: Gray
- Received: Blue
- Under Verification: Yellow
- Verification Passed: Green
- Verification Failed: Red
- Approved: Emerald
- Rejected: Dark Red
- In Secure Storage: Indigo
- On Hold: Orange
- Withdrawal Requested: Purple
- Released: Teal
- In Transit: Amber
- Completed: Dark Green

### Brand Colors
- Primary Purple: `#6B21A8`
- Gold: `#D4AF37`
- Charcoal: `#2C2C2C`
- Light Gray: `#F5F5F5`

---

## Troubleshooting

### Build Errors
1. Clear node_modules: `rm -r node_modules && npm install`
2. Clear cache: `npm cache clean --force`
3. Rebuild: `npm run build`

### Port Already in Use
1. Check: `netstat -ano | findstr :5173` (Windows) or `lsof -i :5173` (Mac/Linux)
2. Kill: `taskkill /PID <PID> /F` (Windows)
3. Or change port: `npm run dev -- --port 3000`

### Styling Issues
1. Clear dist folder: `rm -r dist`
2. Rebuild: `npm run build`
3. Restart dev server: `npm run dev`

### Import Errors
1. Check file paths are correct
2. Verify components exported properly
3. Check capitalization matches import

---

## Component Testing Checklist

- [ ] AssetCard component renders correctly
- [ ] StatusTimeline shows all 13 statuses
- [ ] Modal dialogs open and close properly
- [ ] Filters work correctly
- [ ] Sort functionality works
- [ ] Currency formatting displays correctly
- [ ] Responsive grid changes on different screen sizes
- [ ] Status badges show correct colors
- [ ] Action buttons trigger modals
- [ ] Details modal shows all information
- [ ] Charges table displays correctly
- [ ] Search/filter works across pages

---

## Performance Notes

- Bundle size: ~385 KB (gzipped: ~109 KB)
- All components use React.memo for optimization
- Grid layout uses CSS grid for performance
- Images/emojis are lightweight

---

## Next Steps

1. Connect to Django backend API
2. Implement authentication
3. Add real data from database
4. Set up environment variables for API URL
5. Implement file upload for document management
6. Add print functionality for consignment receipts
7. Add export functionality for reports

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all imports are correct
3. Ensure backend is running (if connected)
4. Review component props and state
