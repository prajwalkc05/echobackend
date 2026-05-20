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
    const { topic } = req.body;
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

// Get analytics
export const getAnalytics = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const quizAttempts = await QuizAttempt.find({ planId });
    const analytics = {
      performance: plan.performance,
      totalQuizzes: quizAttempts.length,
      completedTasks: plan.schedule.reduce((acc, day) => 
        acc + day.tasks.filter(task => task.completed).length, 0
      ),
      totalTasks: plan.schedule.reduce((acc, day) => acc + day.tasks.length, 0),
      progressPercentage: Math.round(
        (plan.schedule.reduce((acc, day) => 
          acc + day.tasks.filter(task => task.completed).length, 0
        ) / plan.schedule.reduce((acc, day) => acc + day.tasks.length, 0)) * 100
      ) || 0
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
