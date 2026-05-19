import StartupIdea from "./startup.model.js";
import { generateAIResponse } from "../../utils/aiHelper.js";

// Generate startup ideas from problem statement
export const generateIdeas = async (req, res) => {
  try {
    const { problem, domain } = req.body;
    const userId = req.user.id;

    if (!problem || problem.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed problem statement (at least 10 characters)",
      });
    }

    // AI Prompt for generating startup ideas
    const prompt = `You are an expert startup advisor. Generate 3-5 innovative startup ideas based on this problem: "${problem}"${domain ? ` in the ${domain} domain` : ''}.

For each idea, provide:
1. A catchy startup name
2. A one-line pitch
3. The specific problem it solves
4. Market demand score (0-100)
5. Competition level (0-100)
6. Revenue potential (0-100)
7. Scalability score (0-100)
8. AI confidence score (0-100)

Also provide 3 quick suggestion phrases for similar problems.

Return ONLY valid JSON in this exact format:
{
  "ideas": [
    {
      "id": "unique-id",
      "name": "Startup Name",
      "pitch": "One-line pitch",
      "problem": "Problem solved",
      "demand": 85,
      "competition": 45,
      "revenue": 78,
      "scalability": 92,
      "confidence": 88
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const parsedResponse = JSON.parse(aiResponse);

    // Save to database
    const savedIdeas = await Promise.all(
      parsedResponse.ideas.map(async (idea) => {
        const startupIdea = new StartupIdea({
          userId,
          ...idea,
          problem,
          domain,
          status: "generated",
        });
        return await startupIdea.save();
      })
    );

    res.status(200).json({
      success: true,
      ideas: savedIdeas,
      suggestions: parsedResponse.suggestions,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate startup ideas",
      error: error.message,
    });
  }
};

// Validate a startup idea
export const validateIdea = async (req, res) => {
  try {
    const { ideaId, ideaData } = req.body;
    const userId = req.user.id;

    const prompt = `You are a startup validation expert. Analyze this startup idea:
Name: ${ideaData.name}
Pitch: ${ideaData.pitch}
Problem: ${ideaData.problem}

Provide a comprehensive validation analysis with:
1. Overall validation score (0-100)
2. Summary (2-3 sentences)
3. Market demand trend (5 data points with months and values)
4. Competition analysis (5 metrics: Innovation, Market Fit, Scalability, Revenue, Team - each 0-100)
5. SWOT analysis (3-4 points each for Strengths, Weaknesses, Opportunities, Threats)
6. Brutal honest roast (5 critical points)

Return ONLY valid JSON in this exact format:
{
  "score": 84,
  "summary": "Your idea shows strong potential...",
  "demandTrend": [
    {"name": "Jan", "value": 65},
    {"name": "Feb", "value": 72}
  ],
  "competitionAnalysis": [
    {"subject": "Innovation", "A": 85, "fullMark": 100}
  ],
  "swot": {
    "strengths": ["point 1", "point 2"],
    "weaknesses": ["point 1", "point 2"],
    "opportunities": ["point 1", "point 2"],
    "threats": ["point 1", "point 2"]
  },
  "roast": ["critical point 1", "critical point 2"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const validation = JSON.parse(aiResponse);

    // Update idea in database
    if (ideaId) {
      await StartupIdea.findByIdAndUpdate(ideaId, {
        validation,
        status: "validated",
      });
    }

    res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Error validating idea:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate idea",
      error: error.message,
    });
  }
};

// Generate MVP plan
export const generateMVP = async (req, res) => {
  try {
    const ideaData = req.body;

    const prompt = `You are a technical product advisor. Create an MVP plan for this startup:
Name: ${ideaData.name}
Pitch: ${ideaData.pitch}

Provide:
1. Recommended tech stacks (frontend, backend, database, ai - 4 options each)
2. MVP features (6-8 features with name, priority (High/Medium/Low), effort (e.g., "2 weeks"), status (core/nice/future))
3. Development timeline (4 phases with phase name, duration, and 3-4 tasks each)
4. Monetization strategies (3 models with model name, revenue range, pros, cons)
5. Recommended stack (array of 4 selected technologies)

Return ONLY valid JSON in this exact format:
{
  "techStacks": {
    "frontend": ["React", "Next.js", "Vue.js", "Angular"],
    "backend": ["Node.js", "Python/Django", "Ruby on Rails", "Go"],
    "database": ["MongoDB", "PostgreSQL", "Firebase", "Supabase"],
    "ai": ["OpenAI API", "Hugging Face", "TensorFlow", "Custom Model"]
  },
  "features": [
    {"name": "User Authentication", "priority": "High", "effort": "2 weeks", "status": "core"}
  ],
  "timeline": [
    {"phase": "Planning & Design", "duration": "2 weeks", "tasks": ["task1", "task2"]}
  ],
  "monetization": [
    {"model": "Freemium", "revenue": "$5-15/mo", "pros": "Easy acquisition", "cons": "Low conversion"}
  ],
  "recommendedStack": ["React", "Node.js", "MongoDB", "OpenAI API"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const mvpPlan = JSON.parse(aiResponse);

    res.status(200).json({
      success: true,
      data: mvpPlan,
    });
  } catch (error) {
    console.error("Error generating MVP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate MVP plan",
      error: error.message,
    });
  }
};

// Generate roadmap
export const generateRoadmap = async (req, res) => {
  try {
    const ideaData = req.body;

    const prompt = `You are a startup growth strategist. Create a 6-month roadmap for this startup:
Name: ${ideaData.name}
Pitch: ${ideaData.pitch}

Provide 6 monthly milestones with:
- month (1-6)
- phase name
- 4 goals
- status (month 1: "completed", month 2: "current", rest: "upcoming")
- 4 key tasks
- 4 tools needed
- 3 tutorial topics
- 4 common mistakes to avoid

Return ONLY valid JSON in this exact format:
{
  "roadmap": [
    {
      "month": 1,
      "phase": "Research & Validation",
      "goals": ["goal1", "goal2", "goal3", "goal4"],
      "status": "completed",
      "tasks": ["task1", "task2", "task3", "task4"],
      "tools": ["tool1", "tool2", "tool3", "tool4"],
      "tutorials": ["tutorial1", "tutorial2", "tutorial3"],
      "mistakes": ["mistake1", "mistake2", "mistake3", "mistake4"]
    }
  ]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const roadmap = JSON.parse(aiResponse);

    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
      error: error.message,
    });
  }
};

// Analyze funding opportunities
export const analyzeFunding = async (req, res) => {
  try {
    const ideaData = req.body;

    const prompt = `You are a venture capital advisor. Analyze funding opportunities for this startup:
Name: ${ideaData.name}
Pitch: ${ideaData.pitch}

Provide:
1. Funding readiness (score 0-100, summary, 5 metrics with name, score, status (good/medium/poor))
2. Funding sources (4 sources with type, amount range, timeline, difficulty (Easy/Medium/Hard), fit score 0-100)
3. Revenue projections (5 years with year, revenue, users, MRR)
4. Investor feedback (3 perspectives: Shark Tank, YC Partner, Angel Investor - each with type, feedback, rating 0-10)
5. Pitch deck sections (10 section names)

Return ONLY valid JSON in this exact format:
{
  "readiness": {
    "score": 72,
    "summary": "Getting close but need more traction",
    "metrics": [
      {"name": "Market Validation", "score": 85, "status": "good"}
    ]
  },
  "sources": [
    {"type": "Bootstrapping", "amount": "$0-50K", "timeline": "Immediate", "difficulty": "Easy", "fit": 85}
  ],
  "projections": [
    {"year": "Year 1", "revenue": "$50K", "users": "500", "mrr": "$4K"}
  ],
  "investorFeedback": [
    {"type": "Shark Tank Investor", "feedback": "The market is huge...", "rating": 6}
  ],
  "pitchDeckSections": ["Problem", "Solution", "Market Size", "Business Model", "Traction", "Competition", "Team", "Financials", "Ask", "Vision"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const funding = JSON.parse(aiResponse);

    res.status(200).json({
      success: true,
      data: funding,
    });
  } catch (error) {
    console.error("Error analyzing funding:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze funding",
      error: error.message,
    });
  }
};

// Chat with AI cofounder
export const chatWithCofounder = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Build context from previous messages
    let conversationContext = "";
    if (context && context.messages) {
      conversationContext = context.messages
        .slice(-5) // Last 5 messages for context
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
    }

    const prompt = `You are an AI Cofounder - a supportive, knowledgeable startup advisor. 

Previous conversation:
${conversationContext}

User message: ${message}

Provide helpful, actionable advice. Be encouraging but realistic. If asked to generate content (landing page, features, etc.), provide specific examples.

Also suggest 2-3 follow-up actions the user can take.

Return ONLY valid JSON in this exact format:
{
  "message": "Your detailed response here...",
  "suggestions": ["Follow-up action 1", "Follow-up action 2", "Follow-up action 3"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const response = JSON.parse(aiResponse);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in cofounder chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message,
    });
  }
};

// Save a startup idea
export const saveIdea = async (req, res) => {
  try {
    const ideaData = req.body;
    const userId = req.user.id;

    const startupIdea = new StartupIdea({
      userId,
      ...ideaData,
      status: "saved",
    });

    await startupIdea.save();

    res.status(201).json({
      success: true,
      message: "Idea saved successfully",
      id: startupIdea._id,
    });
  } catch (error) {
    console.error("Error saving idea:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save idea",
      error: error.message,
    });
  }
};

// Get saved ideas
export const getSavedIdeas = async (req, res) => {
  try {
    const userId = req.user.id;

    const ideas = await StartupIdea.find({ userId }).sort({ createdAt: -1 });

    const savedIds = ideas
      .filter((idea) => idea.status === "saved")
      .map((idea) => idea._id.toString());

    res.status(200).json({
      success: true,
      ideas,
      savedIds,
    });
  } catch (error) {
    console.error("Error fetching saved ideas:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved ideas",
      error: error.message,
    });
  }
};

// Get user progress
export const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const ideas = await StartupIdea.find({ userId });

    // Calculate stats
    const trendingIdeas = ideas.filter((idea) => idea.demand > 80).length;
    const validatedIdeas = ideas.filter((idea) => idea.validation).length;
    const totalIdeas = ideas.length;

    const avgValidation = validatedIdeas > 0
      ? ideas
          .filter((idea) => idea.validation)
          .reduce((sum, idea) => sum + (idea.validation.score || 0), 0) / validatedIdeas
      : 0;

    res.status(200).json({
      success: true,
      data: {
        trendingIdeas,
        successRate: validatedIdeas > 0 ? Math.round((validatedIdeas / totalIdeas) * 100) : 0,
        ideasGenerated: totalIdeas,
        mvpCompletion: Math.min(totalIdeas * 10, 100), // Simple calculation
        validationScore: Math.round(avgValidation),
        fundingReadiness: Math.round(avgValidation * 0.85), // Slightly lower than validation
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};
