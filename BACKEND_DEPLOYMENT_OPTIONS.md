# Backend Deployment Options - Kestrel Security Django

Your Django backend is currently running locally. Here are the best hosting options for smooth production deployment.

---

## 🥇 RECOMMENDED: Railway.app (Best Overall)

**Why:** Easiest Django deployment, GitHub integration, free tier, SQLite support, excellent documentation.

### Pros:
- ✅ One-click GitHub deployment
- ✅ Free tier with $5/month credits
- ✅ PostgreSQL database included
- ✅ Environment variables UI
- ✅ Custom domains
- ✅ Auto-deploy on push
- ✅ Great for beginners

### Cons:
- Paid tier starts after free credits ($5+/month)

### Setup Time: ~15 minutes

### Step-by-Step:

1. **Go to https://railway.app and sign up**
   - Connect GitHub account

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `kerselsecurity` repository
   - Select `backend` folder

3. **Configure environment variables:**
   - Go to Variables tab
   - Add these variables:
   ```
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=yourdomain.railway.app,localhost
   DATABASE_URL=postgresql://user:pass@host/db
   CORS_ALLOWED_ORIGINS=https://kerselsecuritycompany.vercel.app
   ```

4. **Add Procfile to backend:**
   Create `backend/Procfile`:
   ```
   web: gunicorn kestrel_security.wsgi
   release: python manage.py migrate
   ```

5. **Add wsgi requirements:**
   Add to `backend/requirements.txt`:
   ```
   gunicorn==21.2.0
   whitenoise==6.6.0
   ```

6. **Deploy:**
   - Click "Deploy"
   - Railway builds and deploys automatically
   - Get your URL: `https://yourdomain.railway.app/api`

---

## 🥈 Heroku (Popular Alternative)

**Why:** Industry standard, reliable, great documentation, built-in PostgreSQL.

### Pros:
- ✅ Industry standard
- ✅ PostgreSQL add-on
- ✅ Free tier available (with limitations)
- ✅ GitHub integration
- ✅ CLI tools for easy deployment

### Cons:
- Free tier is limited (sleeps after 30 mins inactivity)
- Paid tier: $7+/month

### Setup Time: ~20 minutes

### Step-by-Step:

1. **Sign up at https://heroku.com**

2. **Install Heroku CLI:**
   ```bash
   # Windows
   choco install heroku-cli
   # or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Create Procfile in backend:**
   ```
   web: gunicorn kestrel_security.wsgi
   release: python manage.py migrate
   ```

4. **Add wsgi requirements:**
   Add to `backend/requirements.txt`:
   ```
   gunicorn==21.2.0
   whitenoise==6.6.0
   dj-database-url==2.1.0
   psycopg2-binary==2.9.9
   ```

5. **Initialize Heroku app:**
   ```bash
   cd backend
   heroku login
   heroku create your-app-name
   ```

6. **Configure environment:**
   ```bash
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
   heroku config:set CORS_ALLOWED_ORIGINS=https://kerselsecuritycompany.vercel.app
   heroku addons:create heroku-postgresql:hobby-dev
   ```

7. **Deploy:**
   ```bash
   git push heroku master
   ```

8. **Run migrations:**
   ```bash
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

---

## 🥉 PythonAnywhere (Simplest Setup)

**Why:** Python-focused, no DevOps knowledge needed, easy to use.

### Pros:
- ✅ Easiest to set up
- ✅ Web-based interface
- ✅ PostgreSQL support
- ✅ Great for beginners
- ✅ Pay-as-you-go pricing

### Cons:
- Pricing: $5+/month
- Less automation than others

### Setup Time: ~30 minutes

### Step-by-Step:

1. **Sign up at https://www.pythonanywhere.com**

2. **Upload Django project:**
   - Create new account
   - Go to Files tab
   - Upload backend folder

3. **Create virtualenv:**
   - Go to Web tab
   - Add new web app
   - Select Python + Django
   - Create virtualenv

4. **Configure Django:**
   - Edit WSGI configuration file
   - Set database settings

5. **Set environment variables:**
   - Use `.env` file or settings.py

6. **Create superuser:**
   - Use web console to run:
   ```bash
   python manage.py createsuperuser
   ```

---

## 🔧 AWS Lightsail (Best for Growth)

**Why:** Scalable, affordable, reliable infrastructure.

### Pros:
- ✅ $3.50/month starting price
- ✅ Highly scalable
- ✅ Full control
- ✅ PostgreSQL support
- ✅ Auto-backups

### Cons:
- Requires more setup
- Need basic DevOps knowledge

### Setup Time: ~45 minutes

---

## 📊 Comparison Chart

| Feature | Railway | Heroku | PythonAnywhere | AWS Lightsail |
|---------|---------|--------|----------------|---------------|
| Setup Difficulty | Easy | Medium | Easy | Hard |
| Free Tier | Yes ($5 credits) | Limited | No | No |
| Monthly Cost | $5-20 | $7-50 | $5-25 | $3.50-50 |
| PostgreSQL | ✅ | ✅ | ✅ | ✅ |
| Auto-deploy | ✅ | ✅ | Manual | Manual |
| CLI Tools | ✅ | ✅ | Web UI | AWS CLI |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Best For | Beginners | Production | Learning | Scaling |

---

## 🎯 QUICK RECOMMENDATION

**For smooth, hassle-free deployment: Use Railway.app**

Why:
- Easiest setup (one-click deployment)
- GitHub integration (auto-deploy on push)
- Affordable ($5/month)
- Great support
- No DevOps complexity
- Perfect for startups

---

## ⚙️ Common Setup Steps for Any Platform

### 1. Update Django Settings

In `backend/kestrel_security/settings.py`:

```python
import os
from pathlib import Path

# Security for production
DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# CORS Configuration
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# Database
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media Files (for uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### 2. Create Procfile

`backend/Procfile`:
```
web: gunicorn kestrel_security.wsgi
release: python manage.py migrate
```

### 3. Update requirements.txt

Add these packages:
```
gunicorn==21.2.0
whitenoise==6.6.0
dj-database-url==2.1.0
psycopg2-binary==2.9.9
python-decouple==3.8
```

### 4. Set Environment Variables

Example:
```
DEBUG=False
SECRET_KEY=your-production-secret-key-here
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://kerselsecuritycompany.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 5. Run Migrations on Deployment

Each platform handles this differently, but usually:
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Set `DEBUG = False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Set correct `ALLOWED_HOSTS`
- [ ] Configure CORS for Vercel domain
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (auto with all platforms)
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Test API endpoints from Vercel frontend

---

## 🔗 Connecting Frontend to Backend

After deploying backend, update Vercel environment variable:

1. Go to https://vercel.com/dashboard
2. Select `kerselsecurity` project
3. Go to Settings → Environment Variables
4. Update `VITE_API_BASE_URL`:
   ```
   https://your-backend-domain.com/api
   ```
5. Redeploy frontend

---

## 📞 Support Resources

- Railway: https://docs.railway.app/deploy/django
- Heroku: https://devcenter.heroku.com/articles/deploying-python-and-django
- PythonAnywhere: https://help.pythonanywhere.com/pages/Django
- AWS Lightsail: https://lightsail.aws.amazon.com/ls/docs/en_us/articles

---

## Next Steps

1. Choose hosting platform (recommend Railway)
2. Follow setup guide for chosen platform
3. Get backend URL (e.g., `https://api.yourdomain.com`)
4. Update `VITE_API_BASE_URL` in Vercel
5. Test API connectivity
6. Update marketing app with production URLs

Your system is ready to go live! 🚀
