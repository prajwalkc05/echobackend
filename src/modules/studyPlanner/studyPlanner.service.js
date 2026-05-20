import { generateAIResponse } from "../../utils/aiHelper.js";
import axios from "axios";

export const generateStudyPlanAI = async ({ subject, topics, examDate, dailyHours, difficultyLevel }) => {
  const daysUntilExam = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const cappedDays = Math.min(daysUntilExam, 7);
  const limitedTopics = topics.slice(0, 5);

  const schedule = [];
  
  for (let day = 0; day < Math.min(cappedDays, limitedTopics.length); day++) {
    const topic = limitedTopics[day];
    const date = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
    
    schedule.push({
      day: `Day ${day + 1}`,
      date: date.toISOString().split('T')[0],
      tasks: [
        {
          id: `task_${day}_0`,
          topic,
          type: 'Learn',
          duration: Math.floor(dailyHours * 60 * 0.5),
          description: `Learn ${topic} fundamentals and core concepts`,
          resources: [],
          completed: false
        },
        {
          id: `task_${day}_1`,
          topic,
          type: 'Practice',
          duration: Math.floor(dailyHours * 60 * 0.3),
          description: `Practice ${topic} with exercises`,
          resources: [],
          completed: false
        },
        {
          id: `task_${day}_2`,
          topic,
          type: 'Quiz',
          duration: Math.floor(dailyHours * 60 * 0.2),
          description: `Test ${topic} knowledge`,
          resources: [],
          completed: false
        }
      ]
    });
  }

  try {
    const prompt = `Brief study tip for ${subject}: ${limitedTopics.join(', ')}. Max 100 words.`;
    const aiTip = await generateAIResponse(prompt);
    
    if (aiTip && !aiTip.includes('AI services are temporarily busy') && schedule[0]?.tasks[0]) {
      schedule[0].tasks[0].description = aiTip.substring(0, 200);
    }
  } catch (e) {
    console.log('AI enhancement skipped');
  }

  return { schedule };
};

export const getTopicExplanation = async (topic, style = 'simple') => {
  const prompt = `Create learning module for: ${topic}

Return ONLY valid JSON:
{
  "title": "${topic}",
  "simpleExplanation": "2-3 sentences",
  "detailedExplanation": "detailed paragraph",
  "keyPoints": ["point1", "point2", "point3"],
  "examples": ["example1", "example2"],
  "realWorldApplications": ["app1", "app2"],
  "youtubeLinks": [
    {"title": "video title", "url": "https://youtube.com/watch?v=xxx"}
  ]
}`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return createFallbackExplanation(topic);
    }

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          topic: parsed.title || topic,
          simple: parsed.simpleExplanation || '',
          detailed: parsed.detailedExplanation || '',
          keyPoints: parsed.keyPoints || [],
          examples: parsed.examples || [],
          realWorldApplications: parsed.realWorldApplications || [],
          youtubeLinks: parsed.youtubeLinks || []
        };
      } catch (e) {
        console.error('JSON parse error:', e);
      }
    }
    
    return createFallbackExplanation(topic);
  } catch (error) {
    console.error('Topic explanation failed:', error);
    return createFallbackExplanation(topic);
  }
};

function createFallbackExplanation(topic) {
  return {
    topic,
    simple: `${topic} is an important concept in technology and computer science.`,
    detailed: `${topic} involves understanding core principles and practical applications. Study fundamentals, practice with examples, and apply to real projects.`,
    keyPoints: [
      `Understand ${topic} fundamentals`,
      `Practice with examples`,
      `Apply to real projects`
    ],
    examples: [
      `Basic ${topic} example`,
      `Practical ${topic} application`
    ],
    realWorldApplications: [
      `Used in software development`,
      `Applied in industry solutions`
    ],
    youtubeLinks: [
      {
        title: `${topic} Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`
      },
      {
        title: `${topic} Explained`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained')}`
      }
    ]
  };
}

export const generateQuestions = async (topic, count = 5, difficulty = 'Medium') => {
  const limitedCount = Math.min(count, 5);
  const prompt = `Generate ${limitedCount} MCQ questions about "${topic}".

Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "topic": "${topic}",
    "type": "MCQ",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return createFallbackQuestions(topic, limitedCount, difficulty);
    }
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.slice(0, limitedCount);
    }
    
    return createFallbackQuestions(topic, limitedCount, difficulty);
  } catch (e) {
    console.error("Failed to generate questions:", e);
    return createFallbackQuestions(topic, limitedCount, difficulty);
  }
};

function createFallbackQuestions(topic, count, difficulty) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q${i + 1}`,
      topic,
      type: "MCQ",
      question: `What is an important aspect of ${topic}?`,
      options: ["Fundamental concept", "Advanced theory", "Basic principle", "Core idea"],
      correctAnswer: "Fundamental concept",
      explanation: "Understanding fundamentals is key",
      difficulty
    });
  }
  return questions;
}

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
      reason: `Score in ${topic}: ${score}%. Rescheduling.`,
      changes: { rescheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });
  });

  if (updates.length === 0) {
    updates.push({
      action: 'keepGoing',
      topic: null,
      reason: 'Great performance! Keep it up.',
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
          maxResults: 5,
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

    const invidiousResponse = await axios.get(
      `https://invidious.privacydev.net/api/v1/search?q=${searchQuery}&type=video&page=1`,
      { timeout: 8000 }
    );
    return invidiousResponse.data.slice(0, 5).map(item => ({
      title: item.title,
      channel: item.author,
      url: `https://www.youtube.com/watch?v=${item.videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
      duration: Math.round((item.lengthSeconds || 900) / 60),
      relevance: 80,
    }));
  } catch (error) {
    console.error("Video API error:", error.message);
    return [
      {
        title: `${topic} - Tutorial`,
        channel: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
        thumbnail: '',
        duration: null,
        relevance: 70,
      },
      {
        title: `${topic} for Beginners`,
        channel: 'YouTube',
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
    ? `Brief exam notes for "${topic}". Key points and formulas.`
    : `Study notes for "${topic}". Main concepts and examples.`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return examMode
        ? `# ${topic} - Exam Notes\n\n## Key Points\n- Important concept 1\n- Important concept 2\n\n## Tips\n- Focus on fundamentals`
        : `# ${topic} - Study Notes\n\n## Introduction\n${topic} is important.\n\n## Key Concepts\n- Main concept 1\n- Main concept 2`;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to generate notes:", error);
    return `# ${topic} - Notes\n\nStudy ${topic} fundamentals.`;
  }
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
