# KESTREL SECURITY - Frontend Application

## Gold & Valuables Consignment Management System

This is the frontend React application for Kestrel Security's consignment management system.

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

---

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

---

## 🎨 Design System

### Brand Colors

- **Primary Gold**: `#D4AF37` (Kestrel Gold)
- **Black**: `#000000`
- **Charcoal**: `#2B2B2B`
- **White**: `#FFFFFF`
- **Light Grey**: `#F5F5F5`

### Typography

- **Font Family**: Inter (Google Fonts)

---

## 🔐 Demo Login Credentials

### Client Portal
- **Email**: `client@kestrel.com`
- **Password**: Any password (demo mode)

### Admin Portal
- **Email**: `admin@kestrel.com`
- **Password**: Any password (demo mode)

### Staff Portal
- **Email**: `staff@kestrel.com`
- **Password**: Any password (demo mode)

---

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable components
│   │   └── common/      # Common UI components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── pages/           # Page components
│   │   ├── client/      # Client dashboard pages
│   │   ├── admin/       # Admin dashboard pages
│   │   └── staff/       # Staff dashboard pages
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── package.json         # Dependencies
└── tailwind.config.js   # Tailwind configuration
```

---

## 🎯 Features Implemented

### ✅ Stage 2 Complete - Project Setup & Basic Structure

- [x] Project configuration
- [x] Tailwind CSS setup
- [x] React Router setup
- [x] Authentication context
- [x] Protected routes
- [x] Professional login page
- [x] Role-based navigation
- [x] Premium UI components
- [x] Responsive layout system

### 📱 Dashboards Created

1. **Client Dashboard** - 6 pages
   - Dashboard overview
   - My Consignments
   - Package Tracking
   - Documents
   - Notifications
   - Profile

2. **Admin Dashboard** - 10 pages
   - Admin overview
   - Client Management
   - Staff Management
   - Consignment Management
   - Valuation Management
   - Logistics Management
   - Custody Management
   - Storage Management
   - Reports & Analytics
   - Audit Logs

3. **Staff Dashboard** - 6 pages
   - Staff overview
   - Receiving
   - Valuation
   - Custody
   - Logistics
   - Dispatch

---

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🎨 UI Components

### Common Components

- **Button** - Multiple variants (primary, secondary, outline, danger, success)
- **Input** - Form input with validation
- **Card** - Content container
- **Modal** - Popup dialogs
- **Loader** - Loading spinner
- **StatCard** - Dashboard statistics
- **Navbar** - Top navigation
- **Sidebar** - Side menu navigation
- **Layout** - Page wrapper with nav and sidebar
- **ProtectedRoute** - Route guard for authentication

---

## 🔄 Next Steps

### Stage 3 - Backend Integration
- Connect to REST API
- Implement real authentication
- Add API service methods
- Handle loading and error states

### Stage 4 - Feature Development
- Build complete consignment management
- Implement tracking interface
- Add document upload/download
- Create valuation workflows
- Build logistics management
- Implement custody transfers
- Add storage management
- Create reports and analytics

---

## 🛠️ Technologies Used

- **React 19** - UI framework
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Date-fns** - Date formatting
- **Vite** - Build tool

---

## 📝 Notes

- Currently using mock authentication (any password works)
- All pages have placeholder content
- API integration pending backend completion
- All data is currently hardcoded for demonstration
- Backend API needs to be running on port 5000

---

## 🐛 Known Issues

- None at this stage

---

## 📧 Support

For issues or questions about this frontend application, please contact the development team.

---

© 2024 Kestrel Security. All rights reserved.
