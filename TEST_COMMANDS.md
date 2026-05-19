# 🧪 Test Startup Guide API - Using cURL Commands

## Quick Test Commands

### Step 1: Login First (Get Token)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

**Copy the token from response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Step 2: Set Token as Variable
```bash
# Replace with your actual token
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Step 3: Test Generate Ideas
```bash
curl -X POST http://localhost:8000/api/startup/ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Students struggle with time management and revision during exams",
    "domain": "EdTech"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "ideas": [
    {
      "_id": "...",
      "name": "AI Study Planner",
      "pitch": "Personalized AI-powered study scheduler",
      "demand": 92,
      "competition": 45,
      ...
    }
  ],
  "suggestions": ["AI Revision Assistant", "Smart Study Planner", ...]
}
```

---

### Step 4: Test Get Progress
```bash
curl -X GET http://localhost:8000/api/startup/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "trendingIdeas": 5,
    "successRate": 85,
    "ideasGenerated": 12,
    "mvpCompletion": 60,
    "validationScore": 84,
    "fundingReadiness": 72
  }
}
```

---

### Step 5: Test Get Saved Ideas
```bash
curl -X GET http://localhost:8000/api/startup/saved \
  -H "Authorization: Bearer $TOKEN"
```

---

## All Test Commands (Copy & Paste)

### 1. Generate Ideas
```bash
curl -X POST http://localhost:8000/api/startup/ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problem":"Students struggle with time management","domain":"EdTech"}'
```

### 2. Validate Idea
```bash
curl -X POST http://localhost:8000/api/startup/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "IDEA_ID_HERE",
    "ideaData": {
      "name": "AI Study Planner",
      "pitch": "Personalized AI-powered study scheduler",
      "problem": "Students struggle with time management"
    }
  }'
```

### 3. Generate MVP
```bash
curl -X POST http://localhost:8000/api/startup/mvp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Study Planner",
    "pitch": "Personalized AI-powered study scheduler"
  }'
```

### 4. Generate Roadmap
```bash
curl -X POST http://localhost:8000/api/startup/roadmap \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Study Planner",
    "pitch": "Personalized AI-powered study scheduler"
  }'
```

### 5. Analyze Funding
```bash
curl -X POST http://localhost:8000/api/startup/funding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Study Planner",
    "pitch": "Personalized AI-powered study scheduler"
  }'
```

### 6. Chat with Cofounder
```bash
curl -X POST http://localhost:8000/api/startup/cofounder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How should I price my product?"
  }'
```

### 7. Save Idea
```bash
curl -X POST http://localhost:8000/api/startup/save \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "idea-1",
    "name": "AI Study Planner",
    "pitch": "Personalized AI-powered study scheduler",
    "problem": "Students struggle with time management",
    "demand": 92,
    "competition": 45,
    "revenue": 88,
    "scalability": 95,
    "confidence": 91
  }'
```

### 8. Get Saved Ideas
```bash
curl -X GET http://localhost:8000/api/startup/saved \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Get Progress
```bash
curl -X GET http://localhost:8000/api/startup/progress \
  -H "Authorization: Bearer $TOKEN"
```

---

## Quick Health Check

### Check if Backend is Running
```bash
curl http://localhost:8000/health
```

### Check if Routes are Registered
```bash
curl http://localhost:8000/api/startup/progress \
  -H "Authorization: Bearer $TOKEN"
```

If you get `404` → Routes not registered
If you get `401` → Token invalid
If you get `200` → Everything working!

---

## Using Postman Instead

1. **Import Collection:**
   - Open Postman
   - Import → File → Select `postman/EchoMentor_*.json`

2. **Set Environment:**
   - Add variable: `token` = your JWT token
   - Add variable: `baseUrl` = http://localhost:8000

3. **Test Endpoints:**
   - All requests will use `{{token}}` and `{{baseUrl}}`

---

## Troubleshooting

### Error: "Connection refused"
**Fix:** Backend not running
```bash
cd echomentor-backend
npm start
```

### Error: "401 Unauthorized"
**Fix:** Token expired or invalid
```bash
# Login again to get new token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

### Error: "Failed to generate ideas"
**Fix:** Check backend logs
```bash
# Look for:
📝 Generate Ideas Request
🤖 Calling AI service...
✅ AI Response received
```

---

## Test in Browser (Easier!)

Instead of cURL, just use the frontend:

1. **Start Frontend:**
```bash
cd echomentor
npm run dev
```

2. **Open Browser:**
```
http://localhost:5173
```

3. **Test:**
- Login
- Go to Startup Guide
- Enter problem
- Click Generate

**This is the recommended way to test!** 🎯

---

Built with ❤️ for EchoMentor
