# 🎓 YouTube Course Aggregator

AI-powered course aggregation using YouTube API with intelligent recommendations.

## 🚀 Quick Setup

### 1. Get YouTube API Key

1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "YouTube Data API v3"
4. Create API key (Credentials → API Key)
5. Copy to `.env`:

```env
YOUTUBE_API_KEY=AIzaSyD...your_key_here
```

### 2. Install Dependencies

```bash
npm install axios node-cache
```

### 3. Start Server

```bash
npm start
```

## 📡 API Endpoints

### Search Courses (Public)
```
POST /api/courses/search
Body: {
  "query": "web development",
  "skillLevel": "Beginner"
}
```

### Get Courses by Skill (Public)
```
GET /api/courses/skill/javascript
```

### Get Courses by Career (Public)
```
GET /api/courses/career/web-developer
```

### Get Recommended Courses (Protected)
```
POST /api/courses/recommended
Headers: Authorization: Bearer <token>
Body: {
  "careerGoal": "Full Stack Developer",
  "interests": ["JavaScript", "React"],
  "skillLevel": "Beginner"
}
```

### Generate Learning Path (Protected)
```
POST /api/courses/learning-path
Headers: Authorization: Bearer <token>
Body: {
  "careerGoal": "Full Stack Developer",
  "skillLevel": "Beginner"
}
```

### Save Course (Protected)
```
POST /api/courses/save
Headers: Authorization: Bearer <token>
Body: {
  "courseId": "youtube_abc123",
  "title": "JavaScript Basics",
  "platform": "youtube",
  "url": "https://youtube.com/watch?v=abc123"
}
```

### Get Saved Courses (Protected)
```
GET /api/courses/saved
Headers: Authorization: Bearer <token>
```

### Track Progress (Protected)
```
PUT /api/courses/progress
Headers: Authorization: Bearer <token>
Body: {
  "courseId": "youtube_abc123",
  "progress": 45,
  "status": "in-progress"
}
```

### Remove Saved Course (Protected)
```
DELETE /api/courses/saved/:courseId
Headers: Authorization: Bearer <token>
```

## 📊 Course Object

```javascript
{
  id: "youtube_abc123",
  title: "JavaScript Fundamentals",
  description: "Learn JavaScript from scratch",
  instructor: "Traversy Media",
  platform: "youtube",
  platformIcon: "▶️",
  thumbnail: "https://...",
  difficulty: "Beginner",
  duration: "Variable",
  rating: 4.5,
  students: 150000,
  skills: ["JavaScript", "Web Development"],
  tags: ["beginner-friendly", "tutorial"],
  url: "https://youtube.com/watch?v=...",
  isFree: true,
  certificateAvailable: false,
  source: "YouTube"
}
```

## 🤖 Recommendation Algorithm

Scores courses based on:
- **Interest matching** (2x weight)
- **Skill level matching** (3x weight)
- **Rating boost** (0.5x weight)
- **Free course boost** (1x for beginners)

## 📚 Learning Path Stages

1. **Foundations** (2-4 weeks) - Beginner courses
2. **Core Skills** (4-8 weeks) - Intermediate courses
3. **Advanced Topics** (4-12 weeks) - Advanced courses
4. **Projects & Portfolio** (4-8 weeks) - Project-based learning

## 💾 Database Schema

```javascript
{
  userId: ObjectId,
  courseId: String,
  title: String,
  platform: "youtube",
  url: String,
  thumbnail: String,
  instructor: String,
  difficulty: String,
  progress: Number (0-100),
  status: String (not-started, in-progress, completed),
  savedAt: Date,
  lastAccessedAt: Date,
  completedAt: Date,
  notes: String,
  userRating: Number (0-5)
}
```

## 🧪 Test Endpoints

### Search Courses
```bash
curl -X POST http://localhost:5000/api/courses/search \
  -H "Content-Type: application/json" \
  -d '{"query":"web development","skillLevel":"Beginner"}'
```

### Get Courses by Skill
```bash
curl http://localhost:5000/api/courses/skill/javascript
```

### Get Courses by Career
```bash
curl http://localhost:5000/api/courses/career/web-developer
```

## ⚙️ Caching

- **TTL**: 1 hour
- **Cache Key**: `youtube_topic_skillLevel`
- Reduces API calls and improves response time

## 🔒 Security

- Protected routes require JWT authentication
- API key stored in environment variables
- Input validation on all endpoints

## 📈 Features

✅ YouTube video & playlist search
✅ AI-powered recommendations
✅ 4-stage learning paths
✅ Progress tracking
✅ Save/bookmark courses
✅ Skill-based filtering
✅ Career-based filtering
✅ Intelligent caching

## 🐛 Troubleshooting

**"No courses found"**
- Check YouTube API key in `.env`
- Verify API is enabled in Google Cloud Console
- Try different search query

**"API key invalid"**
- Regenerate key in Google Cloud Console
- Ensure key has YouTube Data API v3 enabled

**"Cache not working"**
- Ensure `node-cache` is installed
- Check cache TTL (default 1 hour)

## 📞 Support

For issues, check:
1. YouTube API key configuration
2. Network connectivity
3. Error logs in console

---

**Ready to launch?** Start the server and test the endpoints! 🚀
