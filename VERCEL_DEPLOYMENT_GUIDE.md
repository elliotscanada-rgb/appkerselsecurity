# Vercel Deployment Guide - Kestrel Security Frontend

This guide walks you through deploying the Kestrel Security React frontend to Vercel.

## Prerequisites

- GitHub account with access to https://github.com/elliotscanada-rgb/kerselsecurity
- Vercel account (sign up at https://vercel.com)
- Backend API running and accessible (for production use)

## Step-by-Step Deployment

### 1. Connect GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account if not already connected
5. Search for and select **`kerselsecurity`** repository
6. Click **"Import"**

### 2. Configure Project Settings

In the import dialog, configure the following:

**Project Name:** (auto-filled as `kerselsecurity`)

**Root Directory:** Select `frontend` from the dropdown
- This tells Vercel to build from the frontend folder

**Build Command:** (should auto-detect as `npm run build`)
- Confirms: `vite build`

**Output Directory:** (should auto-detect as `dist`)
- Confirms: Build outputs to `dist` folder

**Install Command:** (should auto-detect as `npm install`)

### 3. Set Environment Variables

Before deployment, add your production environment variables:

1. In the import dialog, look for **"Environment Variables"** section
2. Add the following:

```
VITE_API_BASE_URL = https://your-backend-api-domain.com/api
```

**Important:** Replace `https://your-backend-api-domain.com/api` with:
- If using Django on Heroku: `https://your-heroku-app.herokuapp.com/api`
- If using custom server: `https://your-domain.com/api`
- Local development: `http://localhost:8000/api` (for testing only)

### 4. Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. You'll see the deployment progress in real-time
4. Once complete, you'll get a preview URL (e.g., `https://kerselsecurity.vercel.app`)

### 5. Verify Deployment

After deployment completes:

1. Visit your deployment URL
2. Test the login page
3. Verify API connectivity:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Check that API calls go to your configured backend URL

## Environment Variables Explained

### VITE_API_BASE_URL

This environment variable tells the frontend where the Django backend API is located.

- **Development:** `http://localhost:8000/api`
- **Production:** Your deployed Django backend URL

The frontend reads this in `src/utils/constants.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

## Updating Environment Variables After Deployment

If you need to change the API URL after deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Update `VITE_API_BASE_URL` with the new URL
4. Click **"Save"**
5. Go to **"Deployments"** and click **"Redeploy"** on the latest deployment

## Automatic Deployments

Vercel will automatically deploy whenever you:
- Push to the `master` branch in GitHub
- Create a pull request (creates preview deployment)

To disable automatic deployments:
1. Go to project **"Settings"** → **"Git"**
2. Uncheck **"Deploy on Push"**

## Backend Hosting Options

Since the frontend is now on Vercel, you need a backend deployment. Options:

### Option 1: Heroku (Free tier available)
```bash
cd backend
heroku create your-app-name
heroku config:set ALLOWED_HOSTS=your-vercel-app.vercel.app,localhost
git push heroku master
```

### Option 2: Railway.app
- Go to https://railway.app
- Connect GitHub repo
- Select `backend` folder
- Configure environment variables

### Option 3: PythonAnywhere
- Go to https://www.pythonanywhere.com
- Upload Django project
- Configure Django settings

### Option 4: AWS/Google Cloud/Azure
- Deploy Django to your preferred cloud provider
- Update `VITE_API_BASE_URL` in Vercel environment variables

## CORS Configuration (Important!)

For the frontend to communicate with the backend, you need to enable CORS.

In your Django backend `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
    "http://localhost:3000",  # for local development
]
```

Or install and use django-cors-headers:

```bash
pip install django-cors-headers
```

Then add to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'corsheaders',
    ...
]
```

And middleware:
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]
```

## Troubleshooting

### Issue: "API not responding" or blank page

**Solution:**
1. Check that `VITE_API_BASE_URL` is set correctly in Vercel environment variables
2. Verify your backend is deployed and running
3. Check browser console (F12) for CORS errors
4. Verify CORS is enabled in Django backend

### Issue: 404 errors on page refresh

**Solution:**
This is already handled in `vercel.json` with routing configuration. If you still see this:
1. Go to Vercel project Settings
2. Create a Rewrite rule: `/*` → `/index.html`

### Issue: Styles not loading properly

**Solution:**
1. Check that Tailwind CSS is properly configured
2. Clear browser cache (Ctrl+Shift+Del)
3. Trigger a rebuild in Vercel

### Issue: Environment variables not updating

**Solution:**
1. After changing environment variables, you MUST redeploy
2. Go to Deployments tab
3. Click the three dots on latest deployment
4. Click "Redeploy"

## Next Steps

1. Deploy Django backend to a hosting service (see Backend Hosting Options above)
2. Update `VITE_API_BASE_URL` with your backend URL
3. Redeploy frontend on Vercel
4. Test full application flow end-to-end
5. Set up custom domain (optional)

## Custom Domain Setup

To use a custom domain:

1. In Vercel project Settings → Domains
2. Enter your domain name
3. Follow DNS configuration instructions provided by Vercel
4. Update `VITE_API_BASE_URL` if needed to match your domain CORS settings

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Django Deployment: Check backend deployment guide
- Frontend Docs: See `frontend/README.md` and responsive design audit documents
