# 🔧 Startup Guide Troubleshooting

## Issue: "Failed to generate ideas. Please try again"

### Possible Causes & Solutions:

### 1. **Backend Server Not Running**
```bash
# Check if server is running
curl http://localhost:8000/api/user/profile

# If not running, start it:
cd echomentor-backend
npm start
```

### 2. **Authentication Token Missing/Invalid**
```bash
# Check browser console for errors
# Look for: "401 Unauthorized" or "Token expired"

# Solution: Logout and login again
```

### 3. **AI Service Not Responding**
Check backend logs for:
```
Groq failed → switching to OpenRouter
OpenRouter failed → switching to HuggingFace
All AI services failed
```

**Solution:**
- Verify API keys in `.env`:
  ```env
  GROQ_API_KEY=gsk_...
  OPENROUTER_API_KEY=sk-or-v1-...
  HF_API_KEY=hf_...
  ```
- Test AI service manually:
  ```bash
  curl https://api.groq.com/openai/v1/models \
    -H "Authorization: Bearer YOUR_GROQ_KEY"
  ```

### 4. **JSON Parsing Error**
Backend logs show:
```
SyntaxError: Unexpected token in JSON
```

**Solution:** Already fixed with `cleanAndParseJSON()` helper
- Removes markdown code blocks
- Trims whitespace
- Handles malformed responses

### 5. **MongoDB Connection Error**
```
MongooseError: Could not connect to MongoDB
```

**Solution:**
```bash
# Check MongoDB URI in .env
MONGO_URI=mongodb+srv://...

# Test connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message))"
```

### 6. **CORS Error**
Browser console shows:
```
Access to fetch blocked by CORS policy
```

**Solution:**
Check `app.js` has CORS enabled:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Testing Checklist

### ✅ Backend Health Check
```bash
# 1. Server running?
curl http://localhost:8000/health

# 2. MongoDB connected?
# Check server logs for: "MongoDB connected successfully"

# 3. Routes registered?
# Check server logs for: "Startup routes registered"
```

### ✅ Frontend Health Check
```bash
# 1. Frontend running?
curl http://localhost:5173

# 2. API base URL correct?
# Check .env: VITE_API_BASE_URL=http://localhost:8000

# 3. Token stored?
# Open browser console:
localStorage.getItem('authToken')
```

### ✅ API Endpoint Test
```bash
# Get your token first
TOKEN="your-jwt-token"

# Test generate ideas
curl -X POST http://localhost:8000/api/startup/ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problem":"Students struggle with time management","domain":"EdTech"}'
```

---

## Common Error Messages

### Error: "Please provide a detailed problem statement"
**Cause:** Problem text is less than 10 characters
**Solution:** Enter a longer problem description (minimum 10 characters)

### Error: "Authentication required"
**Cause:** No JWT token or invalid token
**Solution:** 
1. Logout
2. Login again
3. Token will be refreshed

### Error: "AI service unavailable"
**Cause:** All AI services (Groq, OpenRouter, HuggingFace) failed
**Solution:**
1. Check API keys in `.env`
2. Verify API quotas not exceeded
3. Check internet connection
4. Try again in a few minutes

### Error: "Failed to save idea"
**Cause:** MongoDB write error
**Solution:**
1. Check MongoDB connection
2. Verify user has write permissions
3. Check disk space on MongoDB server

---

## Debug Mode

### Enable Detailed Logging

**Backend:**
```javascript
// In startup.controller.js
console.log('📝 Request:', req.body);
console.log('🤖 AI Response:', aiResponse);
console.log('📊 Parsed Data:', parsedData);
```

**Frontend:**
```javascript
// In StartupHub.tsx
console.log('Sending request:', { problem, domain });
console.log('Response:', response);
console.log('Error:', error);
```

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "startup"
4. Check request/response details

---

## Performance Issues

### Slow AI Response
**Normal:** 5-15 seconds for idea generation
**Slow:** 30+ seconds

**Solutions:**
1. Reduce prompt complexity
2. Use faster AI model
3. Add timeout handling
4. Show loading state to user

### Database Slow
**Solutions:**
1. Add indexes (already done)
2. Limit query results
3. Use pagination
4. Cache frequent queries

---

## Production Deployment Issues

### Issue: Works locally but not on Render/Vercel

**Check:**
1. Environment variables set correctly
2. MongoDB whitelist includes deployment IP
3. CORS allows production domain
4. API keys valid and not rate-limited

**Render Specific:**
```bash
# Check logs
render logs --tail

# Check environment
render env list
```

---

## Quick Fixes

### Reset Everything
```bash
# Backend
cd echomentor-backend
rm -rf node_modules
npm install
npm start

# Frontend
cd echomentor
rm -rf node_modules
npm install
npm run dev
```

### Clear Browser Cache
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test with Postman
1. Import collection from `postman/` folder
2. Set environment variables
3. Login to get token
4. Test each endpoint individually

---

## Getting Help

### Check Logs
**Backend:**
```bash
# Server logs
tail -f logs/server.log

# Or check console output
```

**Frontend:**
```bash
# Browser console (F12)
# Look for red errors
```

### Verify Setup
```bash
# Backend
cd echomentor-backend
node -v  # Should be >= 18
npm list groq-sdk  # Should be installed

# Frontend
cd echomentor
node -v  # Should be >= 18
npm list  # Check all dependencies
```

### Test Individual Components

**Test AI Helper:**
```javascript
// In backend console
const { generateAIResponse } = require('./src/utils/aiHelper.js');
generateAIResponse('Say hello').then(console.log);
```

**Test Database:**
```javascript
// In backend console
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(e => console.log('❌', e));
```

---

## Still Not Working?

1. **Check all environment variables** in both `.env` files
2. **Restart both servers** (backend and frontend)
3. **Clear browser cache** and localStorage
4. **Check API keys** are valid and not expired
5. **Verify MongoDB** connection string is correct
6. **Test with curl** to isolate frontend/backend issues
7. **Check firewall** isn't blocking requests
8. **Review backend logs** for detailed error messages

---

## Contact Support

If issue persists:
1. Collect error logs (backend + frontend)
2. Note exact steps to reproduce
3. Check browser console for errors
4. Test with Postman to verify backend
5. Share error messages and logs

---

Built with ❤️ for EchoMentor
