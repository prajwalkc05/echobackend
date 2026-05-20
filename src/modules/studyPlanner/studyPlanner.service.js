import { generateAIResponse } from "../../utils/aiHelper.js";
import axios from "axios";

export const generateStudyPlanAI = async ({ subject, topics, examDate, dailyHours, difficultyLevel }) => {
  const daysUntilExam = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const cappedDays = Math.min(daysUntilExam, 7); // cap to 7 days to avoid token overflow

  const prompt = `Create a ${cappedDays}-day study plan. Return ONLY valid JSON, no extra text.

Subject: ${subject}, Topics: ${topics.slice(0, 5).join(", ")}, Daily Hours: ${dailyHours}, Difficulty: ${difficultyLevel}

{"schedule":[{"day":"Day 1","date":"YYYY-MM-DD","tasks":[{"topic":"string","type":"Learn|Practice|Review|Quiz","duration":60,"description":"string"}]}]}`;

  const response = await generateAIResponse(prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { schedule: [] };
    // Attempt to fix truncated JSON by trimming to last complete object
    let raw = jsonMatch[0];
    try {
      return JSON.parse(raw);
    } catch {
      // Find last complete day entry and close the JSON
      const lastComplete = raw.lastIndexOf('},');
      if (lastComplete > 0) {
        raw = raw.substring(0, lastComplete + 1) + ']}';
        return JSON.parse(raw);
      }
      return { schedule: [] };
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e.message);
    return { schedule: [] };
  }
};

export const getTopicExplanation = async (topic, style = 'simple') => {
  const prompt = style === 'simple'
    ? `Explain "${topic}" in a way that a 5-year-old can understand. Keep it very simple and fun.`
    : `Provide a detailed technical explanation of "${topic}" including key concepts, formulas, and applications.`;

  const response = await generateAIResponse(prompt);

  const detailedPrompt = `For the topic "${topic}", provide:
1. Key points (3-5 bullet points)
2. Real-world examples (2-3 examples)
3. Real-world applications (2-3 applications)

Format as JSON:
{
  "keyPoints": ["point1", "point2"],
  "examples": ["example1", "example2"],
  "applications": ["app1", "app2"]
}`;

  const detailsResponse = await generateAIResponse(detailedPrompt);
  
  let details = { keyPoints: [], examples: [], applications: [] };
  try {
    const jsonMatch = detailsResponse.match(/\{[\s\S]*\}/);
    details = jsonMatch ? JSON.parse(jsonMatch[0]) : details;
  } catch (e) {
    console.error("Failed to parse details:", e);
  }

  return {
    topic,
    simple: style === 'simple' ? response : '',
    detailed: style === 'detailed' ? response : '',
    keyPoints: details.keyPoints || [],
    examples: details.examples || [],
    realWorldApplications: details.applications || [],
  };
};

export const generateQuestions = async (topic, count = 5, difficulty = 'Medium') => {
  const prompt = `Generate ${count} diverse questions about "${topic}" with ${difficulty} difficulty level.

Include:
- 1-2 MCQs (with 4 options)
- 1-2 Short answer questions
- 1 Long answer question
- 1 Scenario-based question

Format as JSON array:
[
  {
    "id": "q1",
    "topic": "${topic}",
    "type": "MCQ|ShortAnswer|LongAnswer|Scenario",
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "Answer",
    "explanation": "Why this is correct",
    "difficulty": "${difficulty}"
  }
]

Return ONLY valid JSON array.`;

  const response = await generateAIResponse(prompt);
  
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.error("Failed to parse questions:", e);
    return [];
  }
};

export const calculateQuizScore = (questions, answers) => {
  let correctCount = 0;
  const weakAreas = [];

  questions.forEach(q => {
    const userAnswer = answers[q.id];
    if (userAnswer && userAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) {
      correctCount++;
    } else {
      weakAreas.push(q.topic);
    }
  });

  const score = Math.round((correctCount / questions.length) * 100);
  return { score, weakAreas: [...new Set(weakAreas)] };
};

export const generateAdaptiveUpdates = (performance, plan) => {
  const updates = [];
  const topicScores = performance?.topicScores;
  if (!topicScores) return updates;

  // Handle both Map and plain object
  const entries = topicScores instanceof Map
    ? Array.from(topicScores.entries())
    : Object.entries(topicScores);

  const weakTopics = entries
    .filter(([_, score]) => score < 60)
    .map(([topic]) => topic);

  weakTopics.forEach(topic => {
    const score = topicScores instanceof Map ? topicScores.get(topic) : topicScores[topic];
    updates.push({
      action: 'reschedule',
      topic,
      reason: `Your score in ${topic} is ${score}%. Rescheduling for tomorrow.`,
      changes: { rescheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });
    updates.push({
      action: 'addPractice',
      topic,
      reason: `Adding 5 extra practice questions for ${topic}`,
      changes: { addQuestions: 5 }
    });
    updates.push({
      action: 'recommendVideo',
      topic,
      reason: `Recommending beginner-friendly videos for ${topic}`,
      changes: { videoLevel: 'Beginner' }
    });
  });

  if (updates.length === 0) {
    updates.push({
      action: 'keepGoing',
      topic: null,
      reason: 'Great performance! Keep up the current study pace.',
      changes: {}
    });
  }

  return updates;
};

export const getRecommendedVideos = async (topic) => {
  try {
    const searchQuery = encodeURIComponent(`${topic} tutorial`);

    if (process.env.YOUTUBE_API_KEY) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          q: `${topic} tutorial`,
          part: 'snippet',
          type: 'video',
          maxResults: 4,
          key: process.env.YOUTUBE_API_KEY,
          videoDuration: 'medium',
        }
      });
      return response.data.items.map(item => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || '',
        duration: 15,
        relevance: 85,
      }));
    }

    // Fallback: use Invidious public API (no key needed)
    const invidiousResponse = await axios.get(
      `https://invidious.privacydev.net/api/v1/search?q=${searchQuery}&type=video&page=1`,
      { timeout: 8000 }
    );
    return invidiousResponse.data.slice(0, 4).map(item => ({
      title: item.title,
      channel: item.author,
      url: `https://www.youtube.com/watch?v=${item.videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
      duration: Math.round((item.lengthSeconds || 900) / 60),
      relevance: 80,
    }));
  } catch (error) {
    console.error("Video API error:", error.message);
    // Last resort: return curated search links
    return [
      {
        title: `${topic} - Full Tutorial`,
        channel: 'YouTube Search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
        thumbnail: '',
        duration: null,
        relevance: 70,
      },
      {
        title: `${topic} for Beginners`,
        channel: 'YouTube Search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' for beginners')}`,
        thumbnail: '',
        duration: null,
        relevance: 70,
      },
    ];
  }
};

export const generateRevisionNotes = async (topic, examMode = false) => {
  const prompt = examMode
    ? `Generate concise exam-focused revision notes for "${topic}". Include:
1. Key formulas/definitions
2. Important concepts
3. Common mistakes to avoid
4. Quick tips for exam
Format as markdown.`
    : `Generate comprehensive study notes for "${topic}". Include:
1. Introduction
2. Key concepts
3. Examples
4. Applications
5. Summary
Format as markdown.`;

  return await generateAIResponse(prompt);
};

export const calculatePerformanceMetrics = (quizAttempts) => {
  if (!quizAttempts || quizAttempts.length === 0) {
    return {
      overallScore: 0,
      topicScores: new Map(),
      weakTopics: [],
      strongTopics: [],
      studyStreak: 0,
      totalHoursSpent: 0,
      lastUpdated: new Date(),
    };
  }

  const topicScores = new Map();
  const topicAttempts = new Map();

  quizAttempts.forEach(attempt => {
    const topic = attempt.topic;
    if (!topicAttempts.has(topic)) {
      topicAttempts.set(topic, []);
    }
    topicAttempts.get(topic).push(attempt.score);
  });

  topicAttempts.forEach((scores, topic) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    topicScores.set(topic, Math.round(avgScore));
  });

  const allScores = Array.from(topicScores.values());
  const overallScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const weakTopics = Array.from(topicScores.entries())
    .filter(([_, score]) => score < 60)
    .map(([topic, _]) => topic);

  const strongTopics = Array.from(topicScores.entries())
    .filter(([_, score]) => score >= 80)
    .map(([topic, _]) => topic);

  return {
    overallScore,
    topicScores,
    weakTopics,
    strongTopics,
    studyStreak: calculateStudyStreak(quizAttempts),
    totalHoursSpent: calculateTotalHours(quizAttempts),
    lastUpdated: new Date(),
  };
};

const calculateStudyStreak = (quizAttempts) => {
  if (!quizAttempts || quizAttempts.length === 0) return 0;

  const dates = quizAttempts
    .map(a => new Date(a.timestamp).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diff = (current - next) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const calculateTotalHours = (quizAttempts) => {
  return quizAttempts.length * 0.5;
};
