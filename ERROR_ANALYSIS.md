# Backend API Errors Analysis

## Summary
Reviewed Django server logs from terminal output. Found multiple error categories - some expected (permission controls), some requiring investigation.

---

## Error 1: `Forbidden: /api/consignments/my_consignments/` (403)

### Status
✅ **WORKING AS DESIGNED** - This is correct behavior

### Details
- Multiple 403 (Forbidden) responses when accessing `/api/consignments/my_consignments/`
- Terminal shows: `DEBUG: User role = admin`
- **Root Cause**: Logged-in user is `admin@kestrel.com` (admin role)
- **Endpoint restriction**: `my_consignments` is a client-only endpoint
- **Code check**: View includes role validation:
  ```python
  if request.user.role != 'client':
      return Response({'error': 'This endpoint is only for client users'}, status=403)
  ```

### Why It Happens
The dashboard is showing the admin user trying to access the client endpoint. This is correct - admins shouldn't have access to client-specific endpoints.

### How to Test Properly
1. Create/use a client user account (already exist: `client@test.com`, `testclient@test.com`, `Nancy@gmail.com`)
2. Log in as a client user
3. Then `/api/consignments/my_consignments/` will work

### Expected Behavior
✅ Correct - returns 403 when non-client tries to access client endpoint

---

## Error 2: `Bad Request: /api/consignments/` (400)

### Status
⚠️ **REQUIRES INVESTIGATION**

### Details
- Single 400 (Bad Request) error when POST to `/api/consignments/`
- Indicates validation failed on request data
- Appears after 403 error on `my_consignments/`

### Possible Causes
1. Missing required fields (client, item_name, category, declared_value)
2. Invalid data types/formats
3. Permission issue (admin-only endpoint)

### What We Know
- Frontend form submission may have invalid data
- The POST endpoint requires admin permissions
- Database constraints: client field is required (ForeignKey)

### Next Steps
1. Check frontend form validation
2. Add request logging to see exact payload
3. Verify admin is logged in when testing

---

## Error 3: `ProtectedError` When Deleting Client

### Status
✅ **WORKING AS DESIGNED** - This is data integrity protection

### Details
```
django.db.models.deletion.ProtectedError: 
("Cannot delete some instances of model 'Client' because they are referenced 
through protected foreign keys: 'Consignment.client'.", 
{<Consignment: KSL-2026-032875 - Gold Coins>})
```

### Root Cause
- The `Consignment.client` field has `on_delete=models.PROTECT`
- This prevents deletion of a client if they have consignments
- Database integrity feature

### Why It Happens
Client ID 5 has one or more consignments attached:
- `KSL-2026-032875 - Gold Coins` (at minimum)

### Expected Behavior
✅ Correct - prevents orphaned consignments

### How to Resolve
1. First delete all consignments for the client
2. Then delete the client
3. Or use CASCADE if orphaned data is acceptable (not recommended)

---

## Working Endpoints

### ✅ Verified Working
- `GET /api/consignments/` - Returns 200 (1122 bytes)
- `GET /api/clients/` - Returns 200 (1277 bytes)
- `GET /api/consignments/statistics/` - Returns 200 (713 bytes)
- `DELETE /api/consignments/{id}/` - Returns 204 (delete successful)
- `POST /api/auth/login/` - Returns 200 (authentication working)
- `GET /api/consignments/my_consignments/` - Returns 403 only when non-client user tries (correct)

---

## Recommendations

### Priority 1: Test with Client User
```bash
1. Log out as admin
2. Log in as client (e.g., client@test.com / password)
3. Test /api/consignments/my_consignments/
4. Verify charges appear in response
```

### Priority 2: Investigate POST /api/consignments/ 400
```bash
1. Check frontend form submission data
2. Verify all required fields are present
3. Ensure data types match model definition
4. Test with curl/Postman with valid JSON
```

### Priority 3: Update Client Deletion UX
```bash
1. Show warning: "This client has X consignments"
2. Require admin confirmation
3. Or: Delete consignments first, then client
```

---

## Database Integrity Status

### Current Constraints
- ✅ Consignment.client: PROTECTED (correct)
- ✅ Consignment.received_by: SET_NULL (correct)
- ✅ ServiceCharge.consignment: CASCADE (correct)
- ✅ All foreign keys properly defined

### Data Quality
- 3 test consignments exist
- All have valid clients assigned
- All have charges ($75 each: $50 storage + $25 handling)

---

## Next Steps

1. **Test fees display on client dashboard**
   - Log in as client user
   - Verify my_consignments returns service_charges
   - Check if charges display correctly

2. **Fix POST /api/consignments/ error**
   - Verify request format from frontend
   - Check validation logic
   - Add better error messages

3. **Improve error messages**
   - Return more detailed error info
   - Help admins understand why operations fail

---

## Conclusion

Most errors are **working as designed** (permission controls, data integrity).  
Only the 400 error needs investigation - likely a form validation issue.  
**System is stable and secure.**
