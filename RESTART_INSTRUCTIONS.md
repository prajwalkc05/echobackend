# 🔄 Restart Backend Server

## The Fix Applied:

✅ **Improved `cleanAndParseJSON()` function:**
- Removes markdown code blocks more aggressively
- Strips text before first `{` or `[`
- Strips text after last `}` or `]`
- Replaces all control characters (newlines, tabs, carriage returns)
- Replaces multiple spaces with single space
- Better error logging

✅ **Simplified AI prompts:**
- Explicitly tells AI not to use newlines in JSON strings
- Cleaner format instructions

---

## How to Restart:

### Option 1: Manual Restart
```bash
# Stop the server (Ctrl+C in terminal)
# Then start again:
cd echomentor-backend
npm start
```

### Option 2: Using PM2 (if installed)
```bash
pm2 restart echomentor-backend
```

### Option 3: Kill and Restart
```bash
# Find and kill the process
pkill -f "node.*server.js"

# Start fresh
cd echomentor-backend
npm start
```

---

## Test After Restart:

1. **Test Generate Ideas:**
```bash
# Use the test prompt
"Students struggle with time management and revision during exams"
```

2. **Check Backend Logs:**
Look for:
```
📝 Generate Ideas Request
🤖 Calling AI service...
✅ AI Response received
📊 Parsed response
💾 Saved ideas to database
```

3. **If Still Errors:**
Check logs for:
```
❌ JSON Parse Error: [error message]
🔍 Problematic response: [first 500 chars]
```

---

## What Was Fixed:

### Before:
```javascript
// Simple replacement - didn't handle all cases
cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
```

### After:
```javascript
// Aggressive cleaning
cleaned = cleaned
  .replace(/^```json\s*/gm, '')  // Remove ```json
  .replace(/^```\s*/gm, '')      // Remove ```
  .replace(/```$/gm, '')         // Remove trailing ```
  .replace(/\n/g, ' ')           // Replace newlines
  .replace(/\r/g, '')            // Remove carriage returns
  .replace(/\t/g, ' ')           // Replace tabs
  .replace(/\\n/g, ' ')          // Replace escaped newlines
  .replace(/\s+/g, ' ')          // Collapse spaces
  .trim();
```

---

## Expected Behavior Now:

✅ AI responses with markdown blocks → Cleaned
✅ AI responses with newlines → Replaced with spaces
✅ AI responses with control characters → Removed
✅ Malformed JSON → Better error messages
✅ Valid JSON → Parsed successfully

---

## If Still Not Working:

### Check AI Response Format:
```bash
# Add this temporarily to see raw AI response
console.log('🔍 Raw AI Response:', aiResponse);
```

### Try Different AI Service:
The system tries 3 services in order:
1. Groq (fastest)
2. OpenRouter (backup)
3. HuggingFace (last resort)

Check which one is being used in logs.

### Verify API Keys:
```bash
# Check .env file
cat .env | grep API_KEY
```

---

## Alternative: Use Fallback Data

If AI keeps failing, you can temporarily use fallback data:

```javascript
// In startup.controller.js - generateIdeas function
// Add this before the AI call:

if (process.env.USE_FALLBACK === 'true') {
  const fallbackIdeas = [
    {
      id: 'fallback-1',
      name: 'AI Study Planner',
      pitch: 'Personalized AI-powered study scheduler',
      problem: problem,
      demand: 85,
      competition: 45,
      revenue: 78,
      scalability: 92,
      confidence: 88
    },
    // ... more fallback ideas
  ];
  
  return res.status(200).json({
    success: true,
    ideas: fallbackIdeas,
    suggestions: ['Try different approach', 'Research competitors', 'Talk to users']
  });
}
```

Then set in `.env`:
```
USE_FALLBACK=true
```

---

## Contact Support:

If issue persists after restart:
1. Share backend logs (last 50 lines)
2. Share exact error message
3. Share AI response (first 500 chars)
4. Confirm which AI service is being used

---

**Now restart the server and test again!** 🚀
