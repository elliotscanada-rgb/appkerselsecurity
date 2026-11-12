# Authentication & Authorization Guide

## Overview

This guide documents the authentication and role-based access control (RBAC) system for the Premium Asset Tracking & Shipment Management System.

---

## Authentication System

### JWT (JSON Web Tokens)

The system uses JWT for stateless authentication. Each JWT token contains:

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "user_id": "ADM-001",
  "full_name": "John Doe",
  "permissions": ["view_assets", "create_asset", ...],
  "iat": 1684080000,
  "exp": 1684166400
}
```

### Token Lifecycle

1. **Login**: User provides credentials
2. **Access Token**: 24-hour validity for API requests
3. **Refresh Token**: 7-day validity to get new access token
4. **Expiration**: Automatic token refresh or re-login required

---

## Login Flow

### 1. Login Endpoint

**POST /auth/login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@kestrel.local",
    "password": "SecurePassword123!"
  }'
```

**Request:**
```json
{
  "email": "officer@kestrel.local",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "user_id": "OFF-001",
    "email": "officer@kestrel.local",
    "full_name": "Christina Kamberina",
    "role": "officer",
    "department": "Logistics",
    "permissions": [
      "view_assets",
      "update_location",
      "dispatch_shipment",
      ...
    ]
  }
}
```

### 2. Token Storage

Tokens are stored in browser localStorage:

```javascript
// In authService.js
localStorage.setItem('authToken', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('currentUser', JSON.stringify(user));
```

### 3. API Requests with Token

All API requests include the token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 4. Token Refresh

When token is about to expire, automatically refresh it:

```javascript
// POST /auth/refresh
{
  "refreshToken": "..."
}
```

---

## Role-Based Access Control (RBAC)

### Roles

Four role types are defined:

| Role | Display Name | Hierarchy | Use Case |
|------|--------------|-----------|----------|
| admin | Administrator | Level 0 (Highest) | System administration, full access |
| officer | Logistics Officer | Level 1 | Field operations, shipment management |
| staff | Staff Member | Level 2 | Basic operations, data entry |
| customer | Customer | Level 3 (Lowest) | Self-service portal access only |

### Role Permissions

#### Admin (Full Access)
- All permissions granted
- Can manage users, settings, and system
- Can view all assets and shipments
- Can generate reports and analytics

#### Officer
- View and update asset locations
- Dispatch and manage shipments
- Create custody transfers
- Verify security seals
- Generate reports
- Cannot: Create users, delete records, manage system settings

#### Staff
- View assets and consignments
- Update locations (limited)
- Verify seals
- Cannot: Dispatch shipments, create transfers, manage consignments

#### Customer
- View only their own consignments and assets
- Track shipment locations
- View reports related to their shipments
- Cannot: Create consignments, manage locations, view other customers' data

---

## Permission Matrix

### Asset Management

| Permission | Admin | Officer | Staff | Customer |
|-----------|-------|---------|-------|----------|
| VIEW_ASSETS | ✓ | ✓ | ✓ | ✓* |
| CREATE_ASSET | ✓ | ✗ | ✗ | ✗ |
| EDIT_ASSET | ✓ | ✗ | ✗ | ✗ |
| DELETE_ASSET | ✓ | ✗ | ✗ | ✗ |
| VIEW_ASSET_DETAILS | ✓ | ✓ | ✓ | ✓* |
| EXPORT_ASSETS | ✓ | ✓ | ✓ | ✓* |

*Own assets only

### Location Management

| Permission | Admin | Officer | Staff | Customer |
|-----------|-------|---------|-------|----------|
| VIEW_LOCATIONS | ✓ | ✓ | ✓ | ✓* |
| UPDATE_LOCATION | ✓ | ✓ | ✓ | ✗ |
| VIEW_LOCATION_HISTORY | ✓ | ✓ | ✓ | ✓* |

### Shipment Management

| Permission | Admin | Officer | Staff | Customer |
|-----------|-------|---------|-------|----------|
| VIEW_SHIPMENTS | ✓ | ✓ | ✗ | ✓* |
| CREATE_SHIPMENT | ✓ | ✗ | ✗ | ✗ |
| EDIT_SHIPMENT | ✓ | ✓ | ✗ | ✗ |
| DELETE_SHIPMENT | ✓ | ✗ | ✗ | ✗ |
| DISPATCH_SHIPMENT | ✓ | ✓ | ✗ | ✗ |
| ASSIGN_OFFICER | ✓ | ✗ | ✗ | ✗ |

---

## Implementation

### 1. Login Page Integration

**Login.jsx**
```javascript
import { authService } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### 2. Protected Routes

**ProtectedRoute.jsx**
```javascript
import { authService } from '../services/authService';
import { hasPermission } from '../utils/rbac';

const ProtectedRoute = ({ 
  element, 
  role = null, 
  permission = null 
}) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const user = authService.getCurrentUser();

  if (role && user.role !== role) {
    return <div>Access Denied</div>;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return <div>Insufficient Permissions</div>;
  }

  return element;
};
```

### 3. Permission Checks in Components

```javascript
import { hasPermission } from '../utils/rbac';
import { authService } from '../services/authService';

const AssetManagement = () => {
  const user = authService.getCurrentUser();
  const canCreateAsset = hasPermission(user.role, PERMISSIONS.CREATE_ASSET);
  const canDeleteAsset = hasPermission(user.role, PERMISSIONS.DELETE_ASSET);

  return (
    <div>
      {canCreateAsset && (
        <button onClick={() => setShowCreateModal(true)}>
          Create Asset
        </button>
      )}

      {assets.map((asset) => (
        <div key={asset.id}>
          {asset.name}
          {canDeleteAsset && (
            <button onClick={() => deleteAsset(asset.id)}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Security Features

### 1. Password Requirements

- Minimum 12 characters
- At least one uppercase letter
- At least one number
- At least one special character
- Cannot contain username or email

### 2. Two-Factor Authentication (2FA)

```javascript
// Enable 2FA
const { qrCode, secret } = await authService.enableTwoFactor();

// Verify 2FA code
await authService.verifyTwoFactor('123456');
```

### 3. Session Management

- Automatic logout after 24 hours of inactivity
- Token refresh before expiration
- Logout on suspicious activity
- Session tracking across devices

### 4. Password Reset Flow

1. User requests password reset
2. Email with reset link sent
3. User clicks link and provides new password
4. Password updated and user redirected to login

```javascript
// Request reset
await authService.requestPasswordReset('user@example.com');

// Reset with token
await authService.resetPassword(resetToken, newPassword);
```

### 5. Audit Logging

All authentication events logged:

```sql
INSERT INTO audit_logs (user_id, action, entity_type, created_at)
VALUES (1, 'LOGIN', 'AUTHENTICATION', NOW());

INSERT INTO audit_logs (user_id, action, entity_type, created_at)
VALUES (1, 'PERMISSION_DENIED', 'AUTHENTICATION', NOW());
```

---

## Backend Implementation

### Login Endpoint (Node.js/Express)

```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if account is active
  if (!user.is_active) {
    return res.status(403).json({ message: 'Account is inactive' });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Log authentication
  await AuditLog.create({
    user_id: user.id,
    action: 'LOGIN',
    ip_address: req.ip,
  });

  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
  });
});
```

### Middleware: Verify Token

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Middleware: Check Permission

```javascript
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
router.post('/assets', 
  authMiddleware, 
  checkPermission(PERMISSIONS.CREATE_ASSET),
  createAsset
);
```

---

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Security
PASSWORD_RESET_TIMEOUT=3600000
SESSION_TIMEOUT=86400000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# 2FA
TOTP_ISSUER=Kestrel
TOTP_WINDOW=1
```

---

## Best Practices

1. **Always validate tokens** on the backend
2. **Store tokens securely** in httpOnly cookies (if possible)
3. **Implement rate limiting** on login endpoint
4. **Log all authentication events** for audit trail
5. **Use HTTPS only** in production
6. **Rotate JWT secrets** periodically
7. **Implement 2FA** for admin accounts
8. **Monitor for suspicious activity** (multiple failed logins)
9. **Clear tokens on logout** completely
10. **Refresh tokens before expiry** without user interaction

---

## Troubleshooting

### Token Expired
- Automatically refresh token
- If refresh fails, prompt user to login again

### Permission Denied
- Check user role in localStorage
- Verify role has required permission
- Check resource-level access (customer owns resource?)

### Login Failed
- Verify email/password are correct
- Check if account is active
- Check rate limiting (too many failed attempts)
- Verify backend JWT configuration

---

## Testing

### Unit Tests
```javascript
describe('Authentication', () => {
  it('should login successfully', async () => {
    const result = await authService.login(
      'officer@kestrel.local',
      'password123'
    );
    expect(result.success).toBe(true);
    expect(result.user.role).toBe('officer');
  });
});

describe('RBAC', () => {
  it('should check permissions correctly', () => {
    expect(hasPermission('admin', PERMISSIONS.CREATE_ASSET)).toBe(true);
    expect(hasPermission('customer', PERMISSIONS.CREATE_ASSET)).toBe(false);
  });
});
```

---

**Version**: 1.0  
**Last Updated**: November 10, 2026  
**Status**: Production Ready
