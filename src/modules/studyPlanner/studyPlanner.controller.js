import StudyPlan, { QuizAttempt, Question } from "./studyPlanner.model.js";
import {
  generateStudyPlanAI,
  getTopicExplanation,
  generateQuestions as generateQuestionsService,
  calculateQuizScore,
  generateAdaptiveUpdates,
  getRecommendedVideos,
  generateRevisionNotes,
  calculatePerformanceMetrics
} from "./studyPlanner.service.js";
import { generateAIResponse } from "../../utils/aiHelper.js";

// Legacy controller
export const createStudyPlan = async (req, res) => {
  try {
    const { subject, topics, hoursPerDay } = req.body;

    const aiPlan = await generateStudyPlanAI({ subject, topics, hoursPerDay });

    const plan = await StudyPlan.create({
      userId: req.user._id,
      subject,
      topics,
      hoursPerDay,
      plan: [],
    });

    res.json({ success: true, aiPlan, planId: plan._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate study plan
export const generateStudyPlan = async (req, res) => {
  try {
    const { subject, topics, examDate, dailyHours, difficultyLevel } = req.body;

    const aiPlan = await generateStudyPlanAI({
      subject,
      topics,
      examDate,
      dailyHours,
      difficultyLevel
    });

    const plan = await StudyPlan.create({
      userId: req.user._id,
      subject,
      topics,
      examDate: new Date(examDate),
      dailyHours,
      difficultyLevel,
      schedule: aiPlan.schedule || [],
      performance: {
        overallScore: 0,
        topicScores: new Map(),
        weakTopics: [],
        strongTopics: [],
        studyStreak: 0,
        totalHoursSpent: 0,
        lastUpdated: new Date()
      }
    });

    res.json({ success: true, plan, planId: plan._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get topic explanation
export const explainTopic = async (req, res) => {
  try {
    const { topic, style = 'simple' } = req.body;
    const explanation = await getTopicExplanation(topic, style);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate questions
export const generateQuestions = async (req, res) => {
  try {
    const { topic, count = 5, difficulty = 'Medium' } = req.body;
    const questions = await generateQuestionsService(topic, count, difficulty);
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quiz
export const submitQuiz = async (req, res) => {
  try {
    const { planId, topic, questions, answers } = req.body;
    
    const { score, weakAreas } = calculateQuizScore(questions, answers);
    
    const quizAttempt = await QuizAttempt.create({
      userId: req.user._id,
      planId,
      topic,
      questions: questions.map(q => q.id),
      answers,
      score,
      weakAreas
    });

    // Update plan performance
    const plan = await StudyPlan.findById(planId);
    if (plan) {
      const allAttempts = await QuizAttempt.find({ planId });
      plan.performance = calculatePerformanceMetrics(allAttempts);
      await plan.save();
    }

    res.json({ success: true, score, weakAreas, quizId: quizAttempt._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get video recommendations
export const getVideoRecommendations = async (req, res) => {
  try {
    const topic = req.body.topic || req.query.topic;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const videos = await getRecommendedVideos(topic);
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const { taskId, completed, performance } = req.body;

    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Update task completion
    plan.schedule.forEach(day => {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
        if (performance) task.performance = performance;
      }
    });

    plan.updatedAt = new Date();
    await plan.save();

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get adaptive updates
export const getAdaptiveUpdates = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const updates = generateAdaptiveUpdates(plan.performance, plan);
    res.json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate notes
export const generateNotes = async (req, res) => {
  try {
    const { topic, examMode = false } = req.body;
    const notes = await generateRevisionNotes(topic, examMode);
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get plan details
export const getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark task as completed
export const markTaskCompleted = async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { completed = true, timeSpent = 0 } = req.body;

    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    let taskFound = false;
    plan.schedule.forEach(day => {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
        if (timeSpent > 0) {
          plan.performance.totalHoursSpent += timeSpent / 60; // Convert minutes to hours
        }
        taskFound = true;
      }
    });

    if (!taskFound) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update study streak if completing a task
    if (completed) {
      const today = new Date().toDateString();
      const lastUpdate = plan.performance.lastUpdated?.toDateString();
      
      if (lastUpdate !== today) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        if (lastUpdate === yesterday) {
          plan.performance.studyStreak += 1;
        } else if (!lastUpdate) {
          plan.performance.studyStreak = 1;
        } else {
          plan.performance.studyStreak = 1; // Reset streak
        }
      }
    }

    plan.performance.lastUpdated = new Date();
    plan.updatedAt = new Date();
    await plan.save();

    res.json({ 
      success: true, 
      message: completed ? 'Task marked as completed' : 'Task marked as incomplete',
      plan 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get study history
export const getStudyHistory = async (req, res) => {
  try {
    console.log('Getting study history for user:', req.user._id);
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get study plans
    const plans = await StudyPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('subject topics examDate dailyHours performance createdAt updatedAt');

    console.log('Found plans:', plans.length);

    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('topic score timestamp weakAreas');

    console.log('Found quiz attempts:', quizAttempts.length);

    // Calculate overall stats
    const totalPlans = await StudyPlan.countDocuments({ userId: req.user._id });
    const totalQuizzes = await QuizAttempt.countDocuments({ userId: req.user._id });
    
    const avgScore = quizAttempts.length > 0 
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
      : 0;

    const totalHoursStudied = plans.reduce((sum, plan) => 
      sum + (plan.performance?.totalHoursSpent || 0), 0
    );

    const currentStreak = plans.length > 0 
      ? Math.max(...plans.map(plan => plan.performance?.studyStreak || 0))
      : 0;

    const response = {
      success: true,
      history: {
        plans,
        recentQuizzes: quizAttempts.slice(0, 10),
        stats: {
          totalPlans,
          totalQuizzes,
          avgScore,
          totalHoursStudied: Math.round(totalHoursStudied * 10) / 10,
          currentStreak
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlans / limit),
          hasMore: skip + plans.length < totalPlans
        }
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Study history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Failed to retrieve study history'
    });
  }
};

// Generate bulk topics for a subject
export const generateBulkTopics = async (req, res) => {
  try {
    const { subject, level = 'Intermediate', count = 10 } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const limitedCount = Math.min(count, 20); // Limit to 20 topics max
    
    const prompt = `Generate ${limitedCount} essential topics for learning "${subject}" at ${level} level.

Return ONLY a JSON array of topic names:
[
  "Topic 1",
  "Topic 2",
  "Topic 3"
]

Topics should be:
- Comprehensive and cover the subject
- Ordered from basic to advanced
- Practical and learnable
- No duplicates`;

    try {
      const response = await generateStudyPlanAI({ 
        subject, 
        topics: [], 
        examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        dailyHours: 2, 
        difficultyLevel: level 
      });
      
      // Try to get AI-generated topics
      const aiResponse = await generateAIResponse(prompt);
      
      let topics = [];
      
      if (aiResponse && !aiResponse.includes('AI services are temporarily busy')) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            topics = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse AI topics:', e);
          }
        }
      }
      
      // Fallback topics if AI fails
      if (topics.length === 0) {
        topics = generateFallbackTopics(subject, level, limitedCount);
      }
      
      // Ensure we have the requested number of topics
      topics = topics.slice(0, limitedCount);
      
      res.json({
        success: true,
        subject,
        level,
        topics,
        count: topics.length,
        message: `Generated ${topics.length} topics for ${subject}`
      });
      
    } catch (error) {
      console.error('Bulk topic generation failed:', error);
      const fallbackTopics = generateFallbackTopics(subject, level, limitedCount);
      
      res.json({
        success: true,
        subject,
        level,
        topics: fallbackTopics,
        count: fallbackTopics.length,
        message: `Generated ${fallbackTopics.length} topics for ${subject} (fallback)`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate fallback topics
const generateFallbackTopics = (subject, level, count) => {
  const commonTopics = {
    'JavaScript': [
      'Variables and Data Types',
      'Functions and Scope',
      'Objects and Arrays',
      'DOM Manipulation',
      'Event Handling',
      'Asynchronous Programming',
      'Promises and Async/Await',
      'ES6+ Features',
      'Error Handling',
      'Modules and Imports'
    ],
    'Python': [
      'Variables and Data Types',
      'Control Structures',
      'Functions and Modules',
      'Object-Oriented Programming',
      'File Handling',
      'Exception Handling',
      'Libraries and Packages',
      'Data Structures',
      'Regular Expressions',
      'Testing and Debugging'
    ],
    'React': [
      'Components and JSX',
      'Props and State',
      'Event Handling',
      'Lifecycle Methods',
      'Hooks (useState, useEffect)',
      'Context API',
      'Routing',
      'State Management',
      'Performance Optimization',
      'Testing React Apps'
    ],
    'Data Structures': [
      'Arrays and Strings',
      'Linked Lists',
      'Stacks and Queues',
      'Trees and Binary Trees',
      'Hash Tables',
      'Graphs',
      'Heaps',
      'Sorting Algorithms',
      'Searching Algorithms',
      'Dynamic Programming'
    ],
    'Machine Learning': [
      'Introduction to ML',
      'Supervised Learning',
      'Unsupervised Learning',
      'Linear Regression',
      'Classification Algorithms',
      'Decision Trees',
      'Neural Networks',
      'Feature Engineering',
      'Model Evaluation',
      'Deep Learning Basics'
    ]
  };
  
  // Try to find exact match or similar subject
  let topics = commonTopics[subject] || [];
  
  // If no exact match, generate generic topics
  if (topics.length === 0) {
    const genericTopics = [
      `Introduction to ${subject}`,
      `${subject} Fundamentals`,
      `Basic ${subject} Concepts`,
      `${subject} Best Practices`,
      `Advanced ${subject} Topics`,
      `${subject} Applications`,
      `${subject} Tools and Resources`,
      `${subject} Problem Solving`,
      `${subject} Project Work`,
      `${subject} Industry Standards`
    ];
    topics = genericTopics;
  }
  
  // Adjust based on level
  if (level === 'Beginner') {
    topics = topics.slice(0, Math.ceil(topics.length * 0.6)); // First 60% for beginners
  } else if (level === 'Advanced') {
    topics = topics.slice(Math.floor(topics.length * 0.4)); // Last 60% for advanced
  }
  
  return topics.slice(0, count);
};

// Get analytics for a plan
export const getAnalytics = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await StudyPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const quizAttempts = await QuizAttempt.find({ planId });
    const completedTasks = plan.schedule.reduce((acc, day) =>
      acc + day.tasks.filter(t => t.completed).length, 0);
    const totalTasks = plan.schedule.reduce((acc, day) => acc + day.tasks.length, 0);
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
      : 0;

    res.json({
      success: true,
      analytics: {
        completedTasks,
        totalTasks,
        progressPercentage: Math.round((completedTasks / totalTasks) * 100) || 0,
        totalQuizzes: quizAttempts.length,
        averageScore: avgScore,
        studyStreak: plan.performance?.studyStreak || 0,
        totalHoursSpent: plan.performance?.totalHoursSpent || 0,
        weakTopics: plan.performance?.weakTopics || [],
        strongTopics: plan.performance?.strongTopics || [],
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced analytics with detailed tracking
export const getDetailedAnalytics = async (req, res) => {
  try {
    const { planId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Calculate timeframe
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(plan.createdAt);
    }

    const quizAttempts = await QuizAttempt.find({ 
      planId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Calculate progress over time
    const progressData = [];
    const completedTasks = plan.schedule.reduce((acc, day) => 
      acc + day.tasks.filter(task => task.completed).length, 0
    );
    const totalTasks = plan.schedule.reduce((acc, day) => acc + day.tasks.length, 0);
    
    // Topic-wise performance
    const topicPerformance = {};
    plan.topics.forEach(topic => {
      const topicQuizzes = quizAttempts.filter(q => q.topic === topic);
      const avgScore = topicQuizzes.length > 0 
        ? topicQuizzes.reduce((sum, q) => sum + q.score, 0) / topicQuizzes.length
        : 0;
      
      topicPerformance[topic] = {
        averageScore: Math.round(avgScore),
        quizzesTaken: topicQuizzes.length,
        lastAttempt: topicQuizzes.length > 0 ? topicQuizzes[topicQuizzes.length - 1].timestamp : null,
        trend: calculateTrend(topicQuizzes)
      };
    });

    // Study consistency (days studied)
    const studyDays = quizAttempts.reduce((acc, attempt) => {
      const day = attempt.timestamp.toDateString();
      acc.add(day);
      return acc;
    }, new Set());

    const analytics = {
      overview: {
        totalTasks,
        completedTasks,
        progressPercentage: Math.round((completedTasks / totalTasks) * 100) || 0,
        totalQuizzes: quizAttempts.length,
        averageScore: quizAttempts.length > 0 
          ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
          : 0,
        studyStreak: plan.performance?.studyStreak || 0,
        totalHoursSpent: plan.performance?.totalHoursSpent || 0
      },
      topicPerformance,
      studyConsistency: {
        daysStudied: studyDays.size,
        totalDays: Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)),
        consistencyRate: Math.round((studyDays.size / Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))) * 100) || 0
      },
      recentActivity: quizAttempts.slice(-10).map(attempt => ({
        topic: attempt.topic,
        score: attempt.score,
        date: attempt.timestamp,
        weakAreas: attempt.weakAreas
      })),
      weakAreas: plan.performance?.weakTopics || [],
      strongAreas: plan.performance?.strongTopics || [],
      recommendations: generateRecommendations(plan, topicPerformance)
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate trend
const calculateTrend = (quizzes) => {
  if (quizzes.length < 2) return 'stable';
  
  const recent = quizzes.slice(-3);
  const older = quizzes.slice(-6, -3);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, q) => sum + q.score, 0) / recent.length;
  const olderAvg = older.reduce((sum, q) => sum + q.score, 0) / older.length;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
};

// Helper function to generate recommendations
const generateRecommendations = (plan, topicPerformance) => {
  const recommendations = [];
  
  // Check for weak topics
  Object.entries(topicPerformance).forEach(([topic, performance]) => {
    if (performance.averageScore < 60) {
      recommendations.push({
        type: 'review',
        topic,
        message: `Consider reviewing ${topic} - current average: ${performance.averageScore}%`,
        priority: 'high'
      });
    }
  });
  
  // Check study consistency
  const daysStudied = plan.performance?.studyStreak || 0;
  if (daysStudied === 0) {
    recommendations.push({
      type: 'consistency',
      message: 'Start building a study streak by completing tasks daily',
      priority: 'medium'
    });
  } else if (daysStudied < 3) {
    recommendations.push({
      type: 'consistency',
      message: 'Keep up the momentum! Try to study for at least 3 days in a row',
      priority: 'medium'
    });
  }
  
  // Check for topics not attempted
  const attemptedTopics = Object.keys(topicPerformance).filter(topic => 
    topicPerformance[topic].quizzesTaken > 0
  );
  
  const unattemptedTopics = plan.topics.filter(topic => !attemptedTopics.includes(topic));
  
  if (unattemptedTopics.length > 0) {
    recommendations.push({
      type: 'explore',
      topics: unattemptedTopics,
      message: `Try taking quizzes on: ${unattemptedTopics.slice(0, 3).join(', ')}`,
      priority: 'low'
    });
  }
  
  return recommendations;
};
