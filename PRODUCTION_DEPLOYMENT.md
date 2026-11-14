# Production Deployment Configuration

## ✅ Configuration Complete

All files have been updated with your production URLs:

### Production URLs
- **Frontend:** https://app.kestrelsecuritycompany.com
- **Backend API:** https://appkerselsecurity.onrender.com

---

## Files Updated

### Frontend Configuration
1. ✅ `frontend/.env` - Updated to production API URL
2. ✅ `frontend/.env.production` - Created for production builds
3. ✅ `frontend/.env.local` - Created for local development
4. ✅ `frontend/src/utils/constants.js` - Updated fallback API URL

### Backend Configuration
5. ✅ `backend/kestrel_security/settings.py` - Added production domain to CORS and ALLOWED_HOSTS
6. ✅ `backend/.env` - Updated CORS origins and allowed hosts

### Marketing/Landing Pages
7. ✅ `test-landing.html` - Updated with production URLs
8. ✅ `frontend-config.js` - Updated with production configuration

---

## Environment Variables Priority

Vite loads environment files in this order (later overrides earlier):
1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases, ignored by git
3. `.env.[mode]` - Only loaded in specified mode (e.g., `.env.production`)
4. `.env.[mode].local` - Only loaded in specified mode, ignored by git

---

## Deployment Commands

### Frontend (Build for Production)
```bash
cd frontend
npm run build
```
This will:
- Use `.env.production` automatically
- Create optimized build in `frontend/dist/`
- Bundle all assets with production API URL

### Backend (Render.com)
Your backend is already deployed at:
- https://appkerselsecurity.onrender.com

Make sure these environment variables are set in Render dashboard:
```
DEBUG=False
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=appkerselsecurity.onrender.com,.onrender.com
CORS_ALLOWED_ORIGINS=https://app.kestrelsecuritycompany.com,http://app.kestrelsecuritycompany.com
DATABASE_URL=<your-postgres-url>
```

---

## CORS Verification

Your backend now accepts requests from:
- ✅ https://app.kestrelsecuritycompany.com (Production)
- ✅ http://app.kestrelsecuritycompany.com (HTTP fallback)
- ✅ http://localhost:5173-5176 (Local development)
- ✅ http://127.0.0.1:5173-5176 (Local development)

---

## Testing Production Integration

### 1. Test Backend API
```bash
curl https://appkerselsecurity.onrender.com/api/auth/login/
```
Should return: `{"detail":"Authentication credentials were not provided."}`

### 2. Test Frontend Access
Open: https://app.kestrelsecuritycompany.com/login

### 3. Test CORS
Open browser console at your frontend URL and check if API requests succeed (no CORS errors).

---

## Local Development

To work locally while keeping production config:

### Option 1: Use .env.local (Recommended)
The `.env.local` file (already created) will override `.env` for local development:
```bash
cd frontend
npm run dev
```
Will use: http://localhost:8000/api

### Option 2: Temporarily modify .env
Change `frontend/.env` back to localhost when developing locally.

---

## Security Checklist for Production

### Backend (.env on Render)
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY` (not the default one)
- [ ] Configure PostgreSQL `DATABASE_URL`
- [ ] Set `JWT_ACCESS_TOKEN_LIFETIME` appropriately
- [ ] Enable `SECURE_SSL_REDIRECT=True` if needed
- [ ] Review `ALLOWED_HOSTS` - remove wildcards

### Frontend
- [ ] Ensure no API keys are hardcoded
- [ ] Review `.gitignore` to exclude `.env.local`
- [ ] Test authentication flow end-to-end
- [ ] Verify all API endpoints work with HTTPS

---

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check backend logs on Render
2. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
3. Ensure frontend is using HTTPS (not HTTP)
4. Clear browser cache and hard reload

### API Connection Issues
1. Check if backend is online: https://appkerselsecurity.onrender.com/api/auth/
2. Verify frontend is using correct API URL in network tab
3. Check if authentication tokens are being sent

### Login Not Working
1. Check browser console for errors
2. Verify API response in Network tab
3. Ensure backend accepts credentials
4. Check token storage in sessionStorage

---

## Next Steps

1. **Deploy Frontend** to your hosting platform with the built `dist/` folder
2. **Test Login** on production URL
3. **Configure SSL** if not already automatic
4. **Set up monitoring** for both services
5. **Update Marketing Site** "Get Started" button to point to: 
   `https://app.kestrelsecuritycompany.com/login`

---

## Support

If you encounter issues:
1. Check backend logs on Render.com dashboard
2. Check frontend browser console
3. Verify network requests in DevTools
4. Ensure both services are running

---

**Last Updated:** November 14, 2026
**Configuration Status:** ✅ Complete and Ready for Production
