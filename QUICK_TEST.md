# 🚀 Startup Guide - Quick Test Reference

## ⚡ Quick Start (3 Steps)

### 1. Start Servers
```bash
# Terminal 1 - Backend
cd echomentor-backend && npm start

# Terminal 2 - Frontend  
cd echomentor && npm run dev
```

### 2. Login
- Go to http://localhost:5173
- Login with your account
- Navigate to "Startup Guide"

### 3. Test
- Enter: "Students struggle with time management and revision during exams"
- Domain: "EdTech"
- Click "Generate Startup Ideas"
- Wait 10-15 seconds ⏳

---

## 📋 Test Prompts (Copy & Paste)

### EdTech
```
Students struggle with time management and revision during exams
```

### Healthcare
```
Elderly people living alone forget to take medications on time
```

### FinTech
```
Young professionals don't know how to invest and save money wisely
```

### Sustainability
```
Restaurants waste tons of food daily while people go hungry
```

### AI
```
Small businesses can't afford social media managers but need online presence
```

---

## 🔍 What to Check

### ✅ Startup Hub
- [ ] Input box accepts text
- [ ] Domain chips are clickable
- [ ] Loading spinner shows
- [ ] Stats widgets display numbers

### ✅ Idea Lab
- [ ] 3 ideas appear
- [ ] Each has 8 metrics
- [ ] Progress bars animate
- [ ] Buttons work (Validate, Save, MVP, More)

### ✅ Validation Center
- [ ] Score displays (0-100)
- [ ] Bar chart renders
- [ ] Radar chart renders
- [ ] SWOT cards show
- [ ] "Roast Me" button works

### ✅ MVP Builder
- [ ] Tech stacks display
- [ ] Features list shows
- [ ] Timeline renders
- [ ] Monetization cards appear

### ✅ Roadmap Studio
- [ ] 6 milestones show
- [ ] Timeline line visible
- [ ] Click to expand works
- [ ] Progress bar updates

### ✅ Funding Assistant
- [ ] Readiness score shows
- [ ] 4 funding sources display
- [ ] Revenue table renders
- [ ] Investor feedback toggles

### ✅ AI Cofounder
- [ ] Chat input works
- [ ] Messages send
- [ ] AI responds
- [ ] Quick actions work
- [ ] Progress bars show

---

## 🐛 Quick Debug

### Error: "Failed to generate ideas"

**Check Backend Logs:**
```bash
# Look for these:
📝 Generate Ideas Request
🤖 Calling AI service...
✅ AI Response received
💾 Saved ideas to database
```

**If you see:**
```
❌ Error generating ideas
```

**Then check:**
1. MongoDB connected? (Look for "MongoDB connected successfully")
2. AI keys valid? (Check .env file)
3. Token valid? (Logout and login again)

---

## 🔑 Environment Check

### Backend `.env` Must Have:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=supersecretkey
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...
HF_API_KEY=hf_...
```

### Frontend `.env` Must Have:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📊 Expected Behavior

| Action | Expected Result | Time |
|--------|----------------|------|
| Enter problem | Live suggestions appear | Instant |
| Click Generate | Loading spinner shows | Instant |
| AI Processing | Ideas appear | 10-15s |
| Click Validate | Navigate to validation | Instant |
| View charts | Charts render | 1-2s |
| Click MVP | Navigate to MVP | Instant |
| Generate MVP | MVP plan appears | 15-20s |

---

## 🎯 Success Indicators

### ✅ Everything Working:
- No red errors in browser console
- Backend logs show emoji indicators (📝 🤖 ✅ 💾)
- Ideas generate in 10-15 seconds
- All navigation works
- Charts render properly
- Chat responds

### ❌ Something Wrong:
- Red errors in console
- Backend shows ❌ errors
- Ideas don't generate
- Navigation broken
- Charts don't render
- Chat doesn't respond

---

## 🆘 Emergency Fixes

### Fix 1: Restart Everything
```bash
# Kill all processes
pkill -f node

# Restart backend
cd echomentor-backend && npm start

# Restart frontend
cd echomentor && npm run dev
```

### Fix 2: Clear Cache
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Fix 3: Check Logs
```bash
# Backend logs
cd echomentor-backend
tail -f logs/server.log

# Or just watch console output
```

---

## 📞 Quick Help

### Issue: No ideas generated
**Fix:** Check backend logs for AI errors

### Issue: Charts not showing
**Fix:** Check if recharts is installed

### Issue: Navigation broken
**Fix:** Check console for routing errors

### Issue: Slow response
**Normal:** AI takes 10-15 seconds

### Issue: Token expired
**Fix:** Logout and login again

---

## 🎉 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login successfully
- [ ] Startup Hub loads
- [ ] Ideas generate (10-15s)
- [ ] Can navigate to Idea Lab
- [ ] Can validate an idea
- [ ] Charts render in Validation
- [ ] Can generate MVP
- [ ] Can view Roadmap
- [ ] Can analyze Funding
- [ ] Can chat with AI Cofounder
- [ ] Progress updates correctly
- [ ] Can save ideas
- [ ] Can view saved ideas

---

## 🚀 All Good? Deploy!

If all checks pass:
1. Commit changes
2. Push to repository
3. Deploy backend to Render
4. Deploy frontend to Netlify/Vercel
5. Update environment variables
6. Test production URLs
7. 🎉 Launch!

---

**Need detailed help?** Check:
- `STARTUP_COMPLETE.md` - Full summary
- `STARTUP_TROUBLESHOOTING.md` - Debug guide
- `src/modules/startup/README.md` - API docs

---

Built with ❤️ for EchoMentor
