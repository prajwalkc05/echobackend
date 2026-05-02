# 🚀 EchoMentor Render Deployment Guide

## ✅ Your Backend is Already Clean!

Your code uses `process.env.PORT` - no hardcoded localhost URLs found. Ready for deployment!

---

## 📦 Postman Collections Created

### Files in `/postman` folder:
1. **EchoMentor_Auth_APIs.postman_collection.json** - Auth endpoints
2. **EchoMentor_Opportunities_APIs.postman_collection.json** - Opportunities endpoints
3. **EchoMentor_Local.postman_environment.json** - Local environment
4. **EchoMentor_Production.postman_environment.json** - Production environment

### Import to Postman:
1. Open Postman
2. Click **Import** → Select all 4 files
3. Switch between environments using the dropdown (top right)

---

## 🌐 Deploy to Render

### Step 1: Push to GitHub
```bash
cd /Users/macos/Desktop/echomentor-backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** echomentor-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:

```
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@echomentor.com
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
HF_API_KEY=your_huggingface_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMERGENCY_EMAIL=your_emergency_email@gmail.com
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Step 4: Deploy
Click **Create Web Service** - Render will automatically deploy!

---

## 🔧 Update Postman After Deployment

1. Get your Render URL: `https://echomentor-backend.onrender.com`
2. Open Postman
3. Select **EchoMentor Production** environment
4. Update `baseUrl` to: `https://echomentor-backend.onrender.com/api`
5. Save

---

## 🧪 Test Production API

### Test with Postman:
1. Switch to **EchoMentor Production** environment
2. Run **Signup** request
3. Copy token from response
4. Paste token in environment variable `token`
5. Test other APIs

### Test with cURL:
```bash
# Signup
curl -X POST https://echomentor-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'

# Login
curl -X POST https://echomentor-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 📝 Important Notes

### Render Free Tier:
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ⚠️ Spins down after 15 min inactivity (first request takes ~30s)
- ⚠️ 750 hours/month free

### CORS Configuration:
Your app already has `cors()` enabled - works with any frontend!

### MongoDB Atlas:
Make sure to whitelist Render's IP or use `0.0.0.0/0` (all IPs) in MongoDB Atlas Network Access.

---

## 🎯 Frontend Integration

Update your frontend API base URL:

**Development:**
```javascript
const API_URL = 'http://localhost:8000/api';
```

**Production:**
```javascript
const API_URL = 'https://echomentor-backend.onrender.com/api';
```

**Or use environment variables:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

---

## 🐛 Troubleshooting

### Check Logs:
Go to Render Dashboard → Your Service → Logs

### Common Issues:
1. **Build fails:** Check `package.json` has correct start script
2. **500 errors:** Check environment variables are set
3. **MongoDB connection fails:** Whitelist Render IP in MongoDB Atlas
4. **Slow first request:** Normal for free tier (cold start)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] All environment variables added
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Deployment successful (check logs)
- [ ] Test signup/login endpoints
- [ ] Update Postman production environment
- [ ] Update frontend API URL

---

## 🚀 Your API is Live!

**Production URL:** `https://your-app-name.onrender.com`

**API Base:** `https://your-app-name.onrender.com/api`

**Health Check:** `https://your-app-name.onrender.com/` → Should return "EchoMentor API Running 🚀"

Happy Deploying! 🎉
