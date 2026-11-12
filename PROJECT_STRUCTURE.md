# Kestrel Security - Project Structure

## Frontend Application Structure

```
frontend/
├── src/
│   ├── App.jsx                          # Main app component with routing
│   ├── main.jsx                         # React entry point
│   │
│   ├── components/
│   │   └── common/                      # Reusable UI components
│   │       ├── AssetCard.jsx            # [NEW] Asset card for grid display
│   │       ├── Button.jsx               # Standard button component
│   │       ├── Card.jsx                 # Card container component
│   │       ├── Input.jsx                # Input field component
│   │       ├── Layout.jsx               # Main layout with sidebar
│   │       ├── Loader.jsx               # Loading spinner
│   │       ├── Modal.jsx                # Modal dialog component
│   │       ├── Navbar.jsx               # Top navigation bar
│   │       ├── ProtectedRoute.jsx       # Auth route protection
│   │       ├── Sidebar.jsx              # Navigation sidebar
│   │       ├── StatCard.jsx             # Statistics card component
│   │       └── StatusTimeline.jsx       # [NEW] Status history timeline
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx              # Authentication context & hooks
│   │
│   ├── pages/
│   │   ├── Login.jsx                    # Login page with demo credentials
│   │   │
│   │   ├── client/                      # Client portal pages
│   │   │   ├── ClientDashboard.jsx      # [UPDATED] Royal Mint grid dashboard
│   │   │   ├── MyConsignments.jsx       # [UPDATED] Consignments list view
│   │   │   ├── TrackingPage.jsx         # Tracking page
│   │   │   ├── DocumentsPage.jsx        # Documents management
│   │   │   ├── NotificationsPage.jsx    # Notifications
│   │   │   └── ProfilePage.jsx          # User profile
│   │   │
│   │   ├── admin/                       # Admin portal pages
│   │   │   ├── AdminDashboard.jsx       # [UPDATED] Enhanced admin overview
│   │   │   ├── ConsignmentsPage.jsx     # [UPDATED] Consignment management
│   │   │   ├── AssetSpecificationsGuide.md  # [NEW] Admin reference guide
│   │   │   ├── ClientsPage.jsx          # Client management
│   │   │   ├── StaffPage.jsx            # Staff management
│   │   │   ├── ValuationsPage.jsx       # Valuation management
│   │   │   ├── LogisticsPage.jsx        # Logistics operations
│   │   │   ├── CustodyPage.jsx          # Custody tracking
│   │   │   ├── StoragePage.jsx          # Storage management
│   │   │   ├── ReportsPage.jsx          # Reporting & analytics
│   │   │   └── AuditPage.jsx            # Audit logs
│   │   │
│   │   └── staff/                       # Staff portal pages
│   │       ├── StaffDashboard.jsx       # Staff overview
│   │       ├── ReceivingPage.jsx        # Item receiving
│   │       ├── ValuationPage.jsx        # Item valuation
│   │       ├── CustodyPage.jsx          # Custody operations
│   │       ├── LogisticsPage.jsx        # Logistics coordination
│   │       └── DispatchPage.jsx         # Item dispatch
│   │
│   ├── services/
│   │   ├── api.js                       # API client configuration
│   │   └── authService.js               # Authentication service
│   │
│   ├── utils/
│   │   ├── constants.js                 # [UPDATED] 13-status system
│   │   └── formatters.js                # Utility formatters (currency, date, etc.)
│   │
│   ├── index.css                        # Global styles
│   └── App.css                          # App-specific styles
│
├── public/
│   └── favicon.ico                      # App favicon
│
├── dist/                                # Build output (generated)
├── node_modules/                        # Dependencies (generated)
│
├── package.json                         # Dependencies & scripts
├── vite.config.js                       # Vite configuration
├── tailwind.config.js                   # Tailwind CSS config
├── postcss.config.js                    # PostCSS config
└── .gitignore                           # Git ignore rules

```

## Component Hierarchy

```
App.jsx (Root)
├── AuthContext (Authentication wrapper)
│   ├── Login.jsx
│   │
│   ├── ClientDashboard (Client role)
│   │   ├── Layout
│   │   │   ├── Navbar
│   │   │   └── Sidebar
│   │   ├── AssetCard (x5 in grid)
│   │   │   └── Modal Details
│   │   │       └── StatusTimeline
│   │   └── Modal Details
│   │       ├── Specifications
│   │       ├── Charges Table
│   │       └── StatusTimeline
│   │
│   ├── MyConsignments (Client role)
│   │   ├── Layout
│   │   │   ├── Navbar
│   │   │   └── Sidebar
│   │   ├── Search/Filter
│   │   └── ConsignmentList
│   │       └── Modal Details
│   │
│   ├── AdminDashboard (Admin role)
│   │   ├── Layout
│   │   │   ├── Navbar
│   │   │   └── Sidebar
│   │   ├── StatCard (x8)
│   │   ├── Chart Components
│   │   └── Overview Cards
│   │
│   ├── ConsignmentsPage (Admin role)
│   │   ├── Layout
│   │   │   ├── Navbar
│   │   │   └── Sidebar
│   │   ├── Search & Filter
│   │   ├── Table
│   │   ├── Modal Add/Edit
│   │   └── Modal Charges
│   │
│   └── [Other Pages...]
│       └── Layout
│           ├── Navbar
│           └── Sidebar
```

## State Management

### AuthContext
- Manages: `user`, `token`, `roles`
- Methods: `login()`, `logout()`, `isAuthenticated()`
- Used in: All pages via `useAuth()` hook

### Local Component State
- ClientDashboard: Filter, sort, selected asset, modal state
- AdminConsignments: Form data, selected consignment, modal state
- MyConsignments: Search term, status filter, selected item

## Styling System

### Tailwind CSS
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Colors: kestrel-charcoal, kestrel-gold, kestrel-grey (custom)
- Components: btn-primary, btn-secondary, badge, input-field

### CSS Files
- `index.css` - Global styles and Tailwind imports
- `App.css` - App-specific styles
- Component styles - Inline Tailwind classes

## Key Features by Page

### Client Portal
| Page | Features | Status |
|------|----------|--------|
| Dashboard | Grid layout, filters, sort, details, history | ✅ Complete |
| Consignments | List view, search, filter, charges, details | ✅ Complete |
| Tracking | Package tracking (template) | ✅ Partial |
| Documents | Document management (template) | ✅ Partial |
| Notifications | Alert notifications (template) | ✅ Partial |
| Profile | User profile management (template) | ✅ Partial |

### Admin Portal
| Page | Features | Status |
|------|----------|--------|
| Dashboard | Stats cards, charts, financial overview | ✅ Complete |
| Consignments | CRUD, status updates, charge management | ✅ Complete |
| Clients | Client management (template) | ✅ Partial |
| Staff | Staff management (template) | ✅ Partial |
| Valuations | Valuation management (template) | ✅ Partial |
| Logistics | Logistics operations (template) | ✅ Partial |
| Custody | Custody tracking (template) | ✅ Partial |
| Storage | Storage management (template) | ✅ Partial |
| Reports | Reporting & analytics (template) | ✅ Partial |
| Audit | Audit logs (template) | ✅ Partial |

### Staff Portal
| Page | Features | Status |
|------|----------|--------|
| Dashboard | Overview (template) | ✅ Partial |
| Receiving | Item receiving (template) | ✅ Partial |
| Valuation | Item valuation (template) | ✅ Partial |
| Custody | Custody operations (template) | ✅ Partial |
| Logistics | Logistics coordination (template) | ✅ Partial |
| Dispatch | Item dispatch (template) | ✅ Partial |

## Data Models (Constants)

### Consignment Status
13 statuses with colors and descriptions:
- pending, received, under_verification, verification_passed, verification_failed
- approved, rejected, in_secure_storage, on_hold, withdrawal_requested
- released, in_transit, completed

### Asset Categories
- gold_bars, gold_jewellery, precious_metals, diamonds, other

### Charge Types
- storage, transportation, handling, insurance, valuation, other

### User Roles
- client, admin, staff

### Staff Departments
- receiving, custody, logistics, valuation, dispatch

## API Integration Points

Ready to connect to Django backend:
```
GET /api/consignments/              # Fetch all
POST /api/consignments/             # Create new
GET /api/consignments/{id}/         # Fetch one
PATCH /api/consignments/{id}/       # Update
PATCH /api/consignments/{id}/status/  # Update status
POST /api/consignments/{id}/charges/ # Add charge
GET /api/consignments/{id}/history/ # Get status history
```

## File Statistics

| Category | Count |
|----------|-------|
| Pages | 22 |
| Components | 12 |
| Services | 2 |
| Utils | 2 |
| Contexts | 1 |
| Total React Files | 39 |
| Documentation Files | 4 |
| **Total** | **43** |

## Build & Deployment

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Output
- **Size**: ~385 KB (gzipped: ~109 KB)
- **Files**: index.html, CSS bundle, JS bundle
- **Location**: `dist/` directory

## Dependencies (Key)

- **react** - UI framework
- **react-router-dom** - Routing
- **react-icons** - Icon library
- **tailwindcss** - Styling framework
- **vite** - Build tool
- **postcss** - CSS processor
- **axios** - HTTP client (for API)

## Environment Variables (To Configure)

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Kestrel Security
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

This structure follows React best practices with clear separation of concerns, reusable components, and organized file hierarchy ready for scaling.
