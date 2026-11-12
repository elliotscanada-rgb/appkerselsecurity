# KESTREL SECURITY - Frontend Setup Guide

## 🎯 Stage 2 Complete: React Frontend Setup

This guide will help you set up and run the Kestrel Security frontend application.

---

## ✅ What Has Been Built

### 1. **Project Configuration**
- ✅ Vite + React setup
- ✅ Tailwind CSS configured
- ✅ React Router v6 configured
- ✅ Environment variables setup
- ✅ Professional color scheme (Black, Gold, White, Charcoal, Grey)

### 2. **Core Infrastructure**
- ✅ Authentication Context (`AuthContext.jsx`)
- ✅ Protected Route Component
- ✅ API Service with Axios interceptors
- ✅ Authentication Service
- ✅ Constants and utilities
- ✅ Formatters (currency, date, weight, etc.)

### 3. **Reusable UI Components**
Created in `src/components/common/`:
- ✅ **Button** - Multiple variants and sizes
- ✅ **Input** - Form input with validation and icons
- ✅ **Card** - Content container with optional header
- ✅ **Modal** - Popup dialog component
- ✅ **Loader** - Loading spinner with text
- ✅ **StatCard** - Dashboard statistics card
- ✅ **Navbar** - Top navigation with notifications and user menu
- ✅ **Sidebar** - Side navigation with mobile support
- ✅ **Layout** - Complete page wrapper with nav and sidebar
- ✅ **ProtectedRoute** - Route guard for role-based access

### 4. **Login Page**
- ✅ Premium branded login interface
- ✅ Kestrel Security logo and branding
- ✅ Professional form design
- ✅ Mock authentication (for testing)
- ✅ Role-based redirection
- ✅ Demo credentials displayed

### 5. **Client Dashboard (6 Pages)**
Created in `src/pages/client/`:
- ✅ **ClientDashboard.jsx** - Overview with statistics and recent activities
- ✅ **MyConsignments.jsx** - Consignment list (placeholder)
- ✅ **TrackingPage.jsx** - Package tracking (placeholder)
- ✅ **DocumentsPage.jsx** - Document access (placeholder)
- ✅ **NotificationsPage.jsx** - Notification center (placeholder)
- ✅ **ProfilePage.jsx** - Profile management (placeholder)

### 6. **Admin Dashboard (10 Pages)**
Created in `src/pages/admin/`:
- ✅ **AdminDashboard.jsx** - Complete overview with 6 stat cards
- ✅ **ClientsPage.jsx** - Client management (placeholder)
- ✅ **StaffPage.jsx** - Staff management (placeholder)
- ✅ **ConsignmentsPage.jsx** - Consignment management (placeholder)
- ✅ **ValuationsPage.jsx** - Valuation approvals (placeholder)
- ✅ **LogisticsPage.jsx** - Logistics management (placeholder)
- ✅ **CustodyPage.jsx** - Custody transfers (placeholder)
- ✅ **StoragePage.jsx** - Storage management (placeholder)
- ✅ **ReportsPage.jsx** - Reports & analytics (placeholder)
- ✅ **AuditPage.jsx** - Audit logs (placeholder)

### 7. **Staff Dashboard (6 Pages)**
Created in `src/pages/staff/`:
- ✅ **StaffDashboard.jsx** - Task overview with statistics
- ✅ **ReceivingPage.jsx** - Consignment receiving (placeholder)
- ✅ **ValuationPage.jsx** - Valuation submission (placeholder)
- ✅ **CustodyPage.jsx** - Custody transfers (placeholder)
- ✅ **LogisticsPage.jsx** - Shipment management (placeholder)
- ✅ **DispatchPage.jsx** - Dispatch management (placeholder)

---

## 🚀 Installation & Running

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- React 19 & React DOM
- React Router DOM v6
- Axios (HTTP client)
- Tailwind CSS
- React Icons
- Date-fns
- Vite

### Step 2: Start Development Server

```bash
npm run dev
```

The application will start on: `http://localhost:5173`

### Step 3: Test the Application

#### Login with Demo Credentials:

**Client Portal:**
- Email: `client@kestrel.com`
- Password: `any password`
- You'll be redirected to: `/client/dashboard`

**Admin Portal:**
- Email: `admin@kestrel.com`
- Password: `any password`
- You'll be redirected to: `/admin/dashboard`

**Staff Portal:**
- Email: `staff@kestrel.com`
- Password: `any password`
- You'll be redirected to: `/staff/dashboard`

---

## 🎨 Design Features

### Professional Branding
- ✅ Kestrel Security logo with shield icon
- ✅ Premium gold gradient accents
- ✅ Black, charcoal, and gold color scheme
- ✅ Professional Inter font from Google Fonts
- ✅ Smooth transitions and hover effects

### Responsive Design
- ✅ Mobile-first approach
- ✅ Collapsible sidebar on mobile
- ✅ Responsive grid layouts
- ✅ Touch-friendly navigation

### User Experience
- ✅ Loading states with spinners
- ✅ Role-based navigation menus
- ✅ Notification bell with badge
- ✅ User avatar with initials
- ✅ Hover effects and animations
- ✅ Custom scrollbars

---

## 📂 Key Files

### Configuration Files
```
frontend/
├── .env                      # Environment variables
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── vite.config.js            # Vite configuration
```

### Main Application Files
```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Main app with routing
├── index.css                 # Global styles + Tailwind
└── App.css                   # Additional app styles
```

### Core Services
```
src/services/
├── api.js                    # Axios instance with interceptors
└── authService.js            # Authentication API calls
```

### Context & State
```
src/contexts/
└── AuthContext.jsx           # Authentication state management
```

### Utilities
```
src/utils/
├── constants.js              # App-wide constants
└── formatters.js             # Formatting utilities
```

---

## 🔐 Authentication Flow

1. User enters email and password on login page
2. `AuthContext.login()` is called with credentials
3. User data and token stored in localStorage
4. User redirected to appropriate dashboard based on role
5. Protected routes check authentication status
6. Axios interceptor adds token to all API requests
7. Invalid tokens trigger automatic logout

---

## 🎯 Next Development Steps

### Stage 3: Backend API Integration
- [ ] Build Node.js/Express backend
- [ ] Set up PostgreSQL database
- [ ] Create REST API endpoints
- [ ] Implement JWT authentication
- [ ] Connect frontend to real API

### Stage 4: Client Dashboard Features
- [ ] Real consignment data fetching
- [ ] Consignment details view
- [ ] Package tracking with timeline
- [ ] Document upload/download
- [ ] Notifications system
- [ ] Profile editing

### Stage 5: Admin Dashboard Features
- [ ] Client CRUD operations
- [ ] Staff CRUD operations
- [ ] Consignment management
- [ ] Valuation approval workflow
- [ ] Logistics management
- [ ] Custody tracking
- [ ] Storage allocation
- [ ] Report generation
- [ ] Audit log viewing

### Stage 6: Staff Dashboard Features
- [ ] Task assignment and viewing
- [ ] Consignment receiving form
- [ ] Valuation submission form
- [ ] Custody transfer forms
- [ ] Shipment status updates
- [ ] Dispatch management

---

## 🛠️ How to Add New Pages

### 1. Create the Page Component
```jsx
// src/pages/client/NewPage.jsx
import React from 'react';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';

const NewPage = () => {
  const menuItems = [/* your menu items */];
  
  return (
    <Layout menuItems={menuItems}>
      <h1>New Page</h1>
      <Card>
        {/* Your content */}
      </Card>
    </Layout>
  );
};

export default NewPage;
```

### 2. Add Route to App.jsx
```jsx
import NewPage from './pages/client/NewPage';

// Inside Routes component:
<Route
  path="/client/new-page"
  element={
    <ProtectedRoute role="client">
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### 3. Add to Sidebar Menu
```jsx
const menuItems = [
  // ... other items
  { path: '/client/new-page', label: 'New Page', icon: <FaIcon /> },
];
```

---

## 📊 Mock Data Structure

Currently using hardcoded mock data. Examples:

### User Object
```javascript
{
  id: 1,
  email: 'client@kestrel.com',
  name: 'John Doe',
  role: 'client', // or 'admin' or 'staff'
  department: 'receiving' // for staff only
}
```

### Consignment Object
```javascript
{
  id: 1,
  consignmentNumber: 'KSL-2024-001',
  itemName: 'Gold Bars',
  declaredValue: 2500000,
  status: 'storage',
  date: '2024-01-15'
}
```

---

## 🎨 Available Tailwind Classes

### Custom Colors
- `bg-kestrel-gold` / `text-kestrel-gold`
- `bg-kestrel-black` / `text-kestrel-black`
- `bg-kestrel-charcoal` / `text-kestrel-charcoal`
- `bg-kestrel-grey` / `text-kestrel-grey`

### Custom Utilities
- `.btn-primary` - Primary gold button
- `.btn-secondary` - Secondary charcoal button
- `.card` - White card with shadow
- `.input-field` - Styled input
- `.badge` - Pill badge
- `.gold-gradient` - Gold gradient background
- `.hover-lift` - Lift on hover
- `.hover-gold` - Gold text on hover

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or change port in vite.config.js
```

### Tailwind Classes Not Working
```bash
# Rebuild Tailwind
npm run dev
```

### React Icons Not Showing
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📝 Code Style Guidelines

### Component Structure
```jsx
// 1. Imports
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// 2. Component
const ComponentName = () => {
  // 3. Hooks
  const { user } = useAuth();
  const [state, setState] = useState();

  // 4. Functions
  const handleClick = () => {
    // logic
  };

  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 6. Export
export default ComponentName;
```

### Naming Conventions
- Components: PascalCase (`ClientDashboard.jsx`)
- Functions: camelCase (`formatCurrency()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- CSS Classes: kebab-case (`btn-primary`)

---

## ✨ What Makes This Professional

1. **Enterprise-Level Architecture**
   - Modular component structure
   - Separation of concerns
   - Reusable utilities
   - Centralized state management

2. **Security Best Practices**
   - Protected routes
   - Role-based access control
   - Secure token storage
   - Automatic logout on token expiry

3. **Premium UI/UX**
   - Professional color scheme
   - Consistent branding
   - Smooth animations
   - Responsive design
   - Loading states

4. **Developer Experience**
   - Clean code structure
   - Well-documented
   - Easy to extend
   - TypeScript-ready structure

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

---

## 📧 Questions?

If you encounter any issues or have questions about the frontend setup, please refer to:
- `README.md` - General information
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Design system configuration

---

**Status: ✅ STAGE 2 COMPLETE**

The frontend foundation is fully built and ready for backend integration!

© 2024 Kestrel Security. All rights reserved.
