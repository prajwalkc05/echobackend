# 🚀 Startup Guide Backend Module

Complete backend implementation for the EchoMentor Startup Guide feature.

---

## 📁 Module Structure

```
src/modules/startup/
├── startup.routes.js      # API route definitions
├── startup.controller.js  # Business logic & AI integration
├── startup.model.js       # MongoDB schema
└── README.md             # This file
```

---

## 🔌 API Endpoints

All endpoints require authentication via JWT token in header:
```
Authorization: Bearer <token>
```

### 1. Generate Startup Ideas
```http
POST /api/startup/ideas
Content-Type: application/json

{
  "problem": "Students struggle with time management and revision",
  "domain": "EdTech"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "ideas": [
    {
      "_id": "...",
      "id": "unique-id",
      "name": "AI Study Planner",
      "pitch": "Personalized AI-powered study scheduler",
      "problem": "Students struggle with time management",
      "demand": 92,
      "competition": 45,
      "revenue": 88,
      "scalability": 95,
      "confidence": 91,
      "userId": "...",
      "status": "generated",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "suggestions": [
    "AI Revision Assistant",
    "Smart Study Planner",
    "AI Notes Generator"
  ]
}
```

---

### 2. Validate Startup Idea
```http
POST /api/startup/validate
Content-Type: application/json

{
  "ideaId": "mongodb-id",
  "ideaData": {
    "name": "AI Study Planner",
    "pitch": "Personalized AI-powered study scheduler",
    "problem": "Students struggle with time management"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 84,
    "summary": "Your idea shows strong potential with moderate competition",
    "demandTrend": [
      { "name": "Jan", "value": 65 },
      { "name": "Feb", "value": 72 }
    ],
    "competitionAnalysis": [
      { "subject": "Innovation", "A": 85, "fullMark": 100 },
      { "subject": "Market Fit", "A": 78, "fullMark": 100 }
    ],
    "swot": {
      "strengths": ["AI-powered personalization", "Large target market"],
      "weaknesses": ["High competition", "Requires user data"],
      "opportunities": ["Growing EdTech market", "Remote learning trend"],
      "threats": ["Established competitors", "Data privacy concerns"]
    },
    "roast": [
      "Your idea is basically 'Uber for X' but worse",
      "Market demand is high, but so is your competition"
    ]
  }
}
```

---

### 3. Generate MVP Plan
```http
POST /api/startup/mvp
Content-Type: application/json

{
  "name": "AI Study Planner",
  "pitch": "Personalized AI-powered study scheduler"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "techStacks": {
      "frontend": ["React", "Next.js", "Vue.js", "Angular"],
      "backend": ["Node.js", "Python/Django", "Ruby on Rails", "Go"],
      "database": ["MongoDB", "PostgreSQL", "Firebase", "Supabase"],
      "ai": ["OpenAI API", "Hugging Face", "TensorFlow", "Custom Model"]
    },
    "features": [
      {
        "name": "User Authentication",
        "priority": "High",
        "effort": "2 weeks",
        "status": "core"
      }
    ],
    "timeline": [
      {
        "phase": "Planning & Design",
        "duration": "2 weeks",
        "tasks": ["User research", "Wireframes", "Tech stack"]
      }
    ],
    "monetization": [
      {
        "model": "Freemium",
        "revenue": "$5-15/mo",
        "pros": "Easy user acquisition",
        "cons": "Low conversion rate"
      }
    ],
    "recommendedStack": ["React", "Node.js", "MongoDB", "OpenAI API"]
  }
}
```

---

### 4. Generate Roadmap
```http
POST /api/startup/roadmap
Content-Type: application/json

{
  "name": "AI Study Planner",
  "pitch": "Personalized AI-powered study scheduler"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roadmap": [
      {
        "month": 1,
        "phase": "Research & Validation",
        "goals": ["Market research", "Competitor analysis", "User interviews"],
        "status": "completed",
        "tasks": ["Conduct 20+ user interviews", "Create landing page"],
        "tools": ["Figma", "Notion", "Google Analytics"],
        "tutorials": ["How to validate startup ideas"],
        "mistakes": ["Skipping user research", "Building too many features"]
      }
    ]
  }
}
```

---

### 5. Analyze Funding
```http
POST /api/startup/funding
Content-Type: application/json

{
  "name": "AI Study Planner",
  "pitch": "Personalized AI-powered study scheduler"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "readiness": {
      "score": 72,
      "summary": "Getting close but need more traction",
      "metrics": [
        { "name": "Market Validation", "score": 85, "status": "good" },
        { "name": "Team Strength", "score": 65, "status": "medium" }
      ]
    },
    "sources": [
      {
        "type": "Bootstrapping",
        "amount": "$0-50K",
        "timeline": "Immediate",
        "difficulty": "Easy",
        "fit": 85
      }
    ],
    "projections": [
      { "year": "Year 1", "revenue": "$50K", "users": "500", "mrr": "$4K" }
    ],
    "investorFeedback": [
      {
        "type": "Shark Tank Investor",
        "feedback": "The market is huge, but you're too early...",
        "rating": 6
      }
    ],
    "pitchDeckSections": ["Problem", "Solution", "Market Size", "Business Model"]
  }
}
```

---

### 6. Chat with AI Cofounder
```http
POST /api/startup/cofounder
Content-Type: application/json

{
  "message": "How should I price my product?",
  "context": {
    "messages": [
      { "role": "user", "content": "Previous message" },
      { "role": "ai", "content": "Previous response" }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Great question! For a SaaS product targeting students...",
    "suggestions": [
      "Research competitor pricing",
      "Survey potential users",
      "Start with freemium model"
    ]
  }
}
```

---

### 7. Save Startup Idea
```http
POST /api/startup/save
Content-Type: application/json

{
  "id": "unique-id",
  "name": "AI Study Planner",
  "pitch": "Personalized AI-powered study scheduler",
  "problem": "Students struggle with time management",
  "demand": 92,
  "competition": 45,
  "revenue": 88,
  "scalability": 95,
  "confidence": 91
}
```

**Response:**
```json
{
  "success": true,
  "message": "Idea saved successfully",
  "id": "mongodb-id"
}
```

---

### 8. Get Saved Ideas
```http
GET /api/startup/saved
```

**Response:**
```json
{
  "success": true,
  "ideas": [
    {
      "_id": "...",
      "name": "AI Study Planner",
      "pitch": "...",
      "status": "saved",
      "createdAt": "..."
    }
  ],
  "savedIds": ["id1", "id2", "id3"]
}
```

---

### 9. Get User Progress
```http
GET /api/startup/progress
```

**Response:**
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

## 🗄️ Database Schema

### StartupIdea Model

```javascript
{
  userId: ObjectId,           // Reference to User
  id: String,                 // Unique identifier
  name: String,               // Startup name
  pitch: String,              // One-line pitch
  problem: String,            // Problem statement
  domain: String,             // Domain (EdTech, FinTech, etc.)
  demand: Number,             // 0-100
  competition: Number,        // 0-100
  revenue: Number,            // 0-100
  scalability: Number,        // 0-100
  confidence: Number,         // 0-100
  status: String,             // generated, saved, validated, mvp, roadmap, funding
  validation: Mixed,          // Validation data
  mvpPlan: Mixed,            // MVP plan data
  roadmap: Mixed,            // Roadmap data
  funding: Mixed,            // Funding analysis data
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId + createdAt` (descending)
- `userId + status`

---

## 🤖 AI Integration

All endpoints use the `generateAIResponse()` helper from `utils/aiHelper.js`.

### AI Prompts

Each controller function includes carefully crafted prompts that:
1. Define the AI's role (expert advisor, validator, etc.)
2. Provide context about the startup idea
3. Specify exact output format (JSON)
4. Request specific metrics and analysis

### Example AI Helper Usage

```javascript
import { generateAIResponse } from "../../utils/aiHelper.js";

const prompt = `You are an expert startup advisor...`;
const aiResponse = await generateAIResponse(prompt);
const parsedData = JSON.parse(aiResponse);
```

---

## 🔐 Authentication

All routes use `authMiddleware` which:
1. Validates JWT token
2. Extracts user ID
3. Attaches to `req.user.id`

```javascript
import authMiddleware from "../../middleware/authMiddleware.js";
router.post("/ideas", authMiddleware, generateIdeas);
```

---

## 🧪 Testing

### Using Postman

1. **Login first:**
```http
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

2. **Copy the token from response**

3. **Add to headers:**
```
Authorization: Bearer <your-token>
```

4. **Test endpoints:**
```http
POST /api/startup/ideas
{
  "problem": "Students struggle with time management",
  "domain": "EdTech"
}
```

### Using cURL

```bash
# Generate ideas
curl -X POST http://localhost:5000/api/startup/ideas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problem": "Students struggle with time management", "domain": "EdTech"}'

# Get progress
curl -X GET http://localhost:5000/api/startup/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Progress Calculation

The `getProgress` endpoint calculates:

- **trendingIdeas**: Ideas with demand > 80
- **successRate**: (validated ideas / total ideas) * 100
- **ideasGenerated**: Total count of ideas
- **mvpCompletion**: Simple calculation based on total ideas
- **validationScore**: Average validation score
- **fundingReadiness**: 85% of validation score

---

## 🚨 Error Handling

All endpoints include try-catch blocks:

```javascript
try {
  // Logic here
  res.status(200).json({ success: true, data });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Failed to process request",
    error: error.message
  });
}
```

---

## 🔄 Status Flow

Ideas progress through statuses:

```
generated → saved → validated → mvp → roadmap → funding
```

Each endpoint can update the status:
- `generateIdeas`: status = "generated"
- `saveIdea`: status = "saved"
- `validateIdea`: status = "validated"

---

## 📝 Environment Variables

Required in `.env`:

```env
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...  # For AI responses
```

---

## 🚀 Deployment

1. **Install dependencies:**
```bash
npm install
```

2. **Start server:**
```bash
npm start
```

3. **Test endpoints:**
```bash
npm test
```

---

## 🔧 Maintenance

### Adding New Features

1. Add route in `startup.routes.js`
2. Add controller function in `startup.controller.js`
3. Update model if needed in `startup.model.js`
4. Test with Postman
5. Update this README

### Optimizing AI Responses

- Adjust prompts in controller functions
- Add more context to prompts
- Fine-tune response parsing
- Cache common responses

---

## 📈 Performance

- **Indexes**: Added on userId and status for fast queries
- **Pagination**: Can be added to `getSavedIdeas`
- **Caching**: Consider Redis for AI responses
- **Rate Limiting**: Already handled by middleware

---

## 🐛 Common Issues

### Issue: AI response not parsing
**Solution**: Check prompt format, ensure "Return ONLY valid JSON"

### Issue: Authentication failed
**Solution**: Verify JWT token is valid and not expired

### Issue: Ideas not saving
**Solution**: Check MongoDB connection and schema validation

---

## 📞 Support

For issues or questions:
1. Check console logs
2. Verify AI helper is working
3. Test with Postman
4. Check MongoDB connection

---

Built with ❤️ for EchoMentor Startup Guide
