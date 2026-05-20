import { generateAIResponse } from "../../utils/aiHelper.js";
import axios from "axios";

export const generateStudyPlanAI = async ({ subject, topics, examDate, dailyHours, difficultyLevel }) => {
  const daysUntilExam = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const cappedDays = Math.min(daysUntilExam, 7);
  const limitedTopics = topics.slice(0, 5);

  // Create reliable schedule structure
  const schedule = [];
  const taskTypes = ['Learn', 'Practice', 'Review', 'Quiz'];
  
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
          description: `Practice ${topic} with exercises and examples`,
          resources: [],
          completed: false
        },
        {
          id: `task_${day}_2`,
          topic,
          type: 'Quiz',
          duration: Math.floor(dailyHours * 60 * 0.2),
          description: `Test your knowledge of ${topic}`,
          resources: [],
          completed: false
        }
      ]
    });
  }

  // Try to enhance with AI description
  try {
    const prompt = `Create a brief study tip for learning ${subject}. Topics: ${limitedTopics.join(', ')}. Keep it under 100 words.`;
    const aiTip = await generateAIResponse(prompt);
    
    if (aiTip && !aiTip.includes('AI services are temporarily busy') && schedule[0]?.tasks[0]) {
      schedule[0].tasks[0].description = aiTip.substring(0, 200);
    }
  } catch (e) {
    console.log('AI enhancement failed, using default descriptions');
  }

  return { schedule };
};

export const getTopicExplanation = async (topic, style = 'simple') => {
  const prompt = style === 'simple'
    ? `Explain "${topic}" simply in 3 sentences.`
    : `Explain "${topic}" with key concepts and examples.`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return {
        topic,
        simple: style === 'simple' ? `${topic} is an important concept to understand. It involves key principles and applications. Study the fundamentals first.` : '',
        detailed: style === 'detailed' ? `${topic} involves several key concepts and practical applications. Focus on understanding the core principles.` : '',
        keyPoints: [`Understand ${topic} basics`, `Practice examples`, `Apply concepts`],
        examples: [`Basic ${topic} example`, `Real-world application`],
        realWorldApplications: [`Used in industry`, `Academic applications`],
      };
    }

    return {
      topic,
      simple: style === 'simple' ? response : '',
      detailed: style === 'detailed' ? response : '',
      keyPoints: [`Key concept 1`, `Key concept 2`, `Key concept 3`],
      examples: [`Example 1`, `Example 2`],
      realWorldApplications: [`Application 1`, `Application 2`],
    };
  } catch (error) {
    console.error("Topic explanation failed:", error);
    return {
      topic,
      simple: `${topic} is an important concept. Study the fundamentals and practice regularly.`,
      detailed: `${topic} involves key principles and applications. Focus on understanding core concepts.`,
      keyPoints: [`Understand ${topic} basics`, `Practice examples`],
      examples: [`Basic example`, `Practical application`],
      realWorldApplications: [`Industry use`, `Academic application`],
    };
  }
};

export const generateQuestions = async (topic, count = 5, difficulty = 'Medium') => {
  const limitedCount = Math.min(count, 3); // Limit to 3 questions to reduce tokens
  const prompt = `Generate ${limitedCount} questions about "${topic}".

Return JSON array:
[
  {
    "id": "q1",
    "topic": "${topic}",
    "type": "MCQ",
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return [{
        id: "q1",
        topic,
        type: "MCQ",
        question: `What is the main concept of ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This covers the basic concept",
        difficulty
      }];
    }
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.error("Failed to generate questions:", e);
    return [{
      id: "q1",
      topic,
      type: "MCQ",
      question: `What is ${topic}?`,
      options: ["Basic concept", "Advanced topic", "Complex theory", "Simple idea"],
      correctAnswer: "Basic concept",
      explanation: "Understanding the fundamentals",
      difficulty
    }];
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
    ? `Generate brief exam notes for "${topic}". Include key points and formulas.`
    : `Generate study notes for "${topic}". Include main concepts and examples.`;

  try {
    const response = await generateAIResponse(prompt);
    
    if (!response || response.includes('AI services are temporarily busy')) {
      return examMode
        ? `# ${topic} - Exam Notes\n\n## Key Points\n- Important concept 1\n- Important concept 2\n\n## Formulas\n- Key formula or definition\n\n## Tips\n- Focus on fundamentals\n- Practice examples`
        : `# ${topic} - Study Notes\n\n## Introduction\n${topic} is an important subject area.\n\n## Key Concepts\n- Main concept 1\n- Main concept 2\n\n## Examples\n- Basic example\n- Practical application\n\n## Summary\nFocus on understanding the core principles.`;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to generate notes:", error);
    return `# ${topic} - Notes\n\nStudy the fundamentals of ${topic}. Practice regularly and focus on key concepts.`;
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
