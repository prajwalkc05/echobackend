import StartupIdea from "./startup.model.js";
import { generateAIResponse } from "../../utils/aiHelper.js";

// Helper function to clean and parse AI JSON responses
const cleanAndParseJSON = (response) => {
  try {
    let cleaned = response.trim();
    
    // Remove markdown code blocks (```json or ```)
    cleaned = cleaned.replace(/^```json\s*/gm, '').replace(/^```\s*/gm, '').replace(/```$/gm, '');
    
    // Remove any text before the first { or [
    const jsonStart = cleaned.search(/[{\[]/);
    if (jsonStart > 0) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    // Remove any text after the last } or ]
    const jsonEnd = cleaned.lastIndexOf('}') > cleaned.lastIndexOf(']') 
      ? cleaned.lastIndexOf('}') 
      : cleaned.lastIndexOf(']');
    if (jsonEnd > 0) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    // Replace control characters and fix common issues
    cleaned = cleaned
      .replace(/\n/g, ' ')  // Replace newlines with spaces
      .replace(/\r/g, '')   // Remove carriage returns
      .replace(/\t/g, ' ')  // Replace tabs with spaces
      .replace(/\\n/g, ' ') // Replace escaped newlines
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Parse JSON
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ JSON Parse Error:', error.message);
    console.error('🔍 Problematic response:', response.substring(0, 500));
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

// Generate startup ideas from problem statement
export const generateIdeas = async (req, res) => {
  try {
    const { problem, domain } = req.body;
    const userId = req.user.id;

    console.log('📝 Generate Ideas Request:', { problem, domain, userId });

    if (!problem || problem.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed problem statement (at least 10 characters)",
      });
    }

    // AI Prompt for generating startup ideas
    const prompt = `You are an expert startup advisor. Generate 3 innovative startup ideas based on this problem: "${problem}"${domain ? ` in the ${domain} domain` : ''}.

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

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "ideas": [
    {
      "id": "idea-1",
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

    console.log('🤖 Calling AI service...');
    const aiResponse = await generateAIResponse(prompt);
    console.log('✅ AI Response received:', aiResponse.substring(0, 200));

    const parsedResponse = cleanAndParseJSON(aiResponse);
    console.log('📊 Parsed response:', parsedResponse);

    // Save to database
    const savedIdeas = await Promise.all(
      parsedResponse.ideas.map(async (idea) => {
        const startupIdea = new StartupIdea({
          userId,
          ...idea,
          problem,
          domain: domain || '',
          status: "generated",
        });
        return await startupIdea.save();
      })
    );

    console.log('💾 Saved ideas to database:', savedIdeas.length);

    res.status(200).json({
      success: true,
      ideas: savedIdeas,
      suggestions: parsedResponse.suggestions || [],
    });
  } catch (error) {
    console.error('❌ Error generating ideas:', error);
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

    console.log('🔍 Validate Idea Request:', { ideaId, ideaName: ideaData?.name });

    const prompt = `You are a startup validation expert. Analyze this startup idea:
Name: ${ideaData.name}
Pitch: ${ideaData.pitch}
Problem: ${ideaData.problem}

Provide a comprehensive validation analysis.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "score": 84,
  "summary": "Your idea shows strong potential...",
  "demandTrend": [
    {"name": "Jan", "value": 65},
    {"name": "Feb", "value": 72},
    {"name": "Mar", "value": 78},
    {"name": "Apr", "value": 85},
    {"name": "May", "value": 92}
  ],
  "competitionAnalysis": [
    {"subject": "Innovation", "A": 85, "fullMark": 100},
    {"subject": "Market Fit", "A": 78, "fullMark": 100},
    {"subject": "Scalability", "A": 92, "fullMark": 100},
    {"subject": "Revenue", "A": 75, "fullMark": 100},
    {"subject": "Team", "A": 68, "fullMark": 100}
  ],
  "swot": {
    "strengths": ["point 1", "point 2", "point 3"],
    "weaknesses": ["point 1", "point 2", "point 3"],
    "opportunities": ["point 1", "point 2", "point 3"],
    "threats": ["point 1", "point 2", "point 3"]
  },
  "roast": ["critical point 1", "critical point 2", "critical point 3", "critical point 4", "critical point 5"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const validation = cleanAndParseJSON(aiResponse);

    // Update idea in database
    if (ideaId) {
      await StartupIdea.findByIdAndUpdate(ideaId, {
        validation,
        status: "validated",
      });
    }

    console.log('✅ Validation complete');

    res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('❌ Error validating idea:', error);
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

    console.log('🛠️ Generate MVP Request:', ideaData?.name);

    const prompt = `You are a technical product advisor. Create an MVP plan for: ${ideaData.name} - ${ideaData.pitch}

Return ONLY valid JSON (no markdown):
{
  "techStacks": {
    "frontend": ["React", "Next.js", "Vue.js", "Angular"],
    "backend": ["Node.js", "Python/Django", "Ruby on Rails", "Go"],
    "database": ["MongoDB", "PostgreSQL", "Firebase", "Supabase"],
    "ai": ["OpenAI API", "Hugging Face", "TensorFlow", "Custom Model"]
  },
  "features": [
    {"name": "User Authentication", "priority": "High", "effort": "2 weeks", "status": "core"},
    {"name": "AI Integration", "priority": "High", "effort": "3 weeks", "status": "core"},
    {"name": "Dashboard", "priority": "Medium", "effort": "2 weeks", "status": "nice"},
    {"name": "Analytics", "priority": "Medium", "effort": "1 week", "status": "nice"},
    {"name": "Mobile App", "priority": "Low", "effort": "4 weeks", "status": "future"},
    {"name": "Social Features", "priority": "Low", "effort": "2 weeks", "status": "future"}
  ],
  "timeline": [
    {"phase": "Planning & Design", "duration": "2 weeks", "tasks": ["User research", "Wireframes", "Tech stack"]},
    {"phase": "Core Development", "duration": "6 weeks", "tasks": ["Auth system", "AI integration", "Database"]},
    {"phase": "Testing & Polish", "duration": "2 weeks", "tasks": ["Bug fixes", "UI polish", "Performance"]},
    {"phase": "Beta Launch", "duration": "1 week", "tasks": ["Deploy", "User feedback", "Iterate"]}
  ],
  "monetization": [
    {"model": "Freemium", "revenue": "$5-15/mo", "pros": "Easy acquisition", "cons": "Low conversion"},
    {"model": "Subscription", "revenue": "$20-50/mo", "pros": "Predictable revenue", "cons": "Higher barrier"},
    {"model": "Pay-per-use", "revenue": "Variable", "pros": "Flexible pricing", "cons": "Unpredictable"}
  ],
  "recommendedStack": ["React", "Node.js", "MongoDB", "OpenAI API"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const mvpPlan = cleanAndParseJSON(aiResponse);

    console.log('✅ MVP plan generated');

    res.status(200).json({
      success: true,
      data: mvpPlan,
    });
  } catch (error) {
    console.error('❌ Error generating MVP:', error);
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

    console.log('🗺️ Generate Roadmap Request:', ideaData?.name);

    const prompt = `Create a 6-month roadmap for: ${ideaData.name}

Return ONLY valid JSON (no markdown):
{
  "roadmap": [
    {
      "month": 1,
      "phase": "Research & Validation",
      "goals": ["Market research", "Competitor analysis", "User interviews", "Problem validation"],
      "status": "completed",
      "tasks": ["Conduct 20+ user interviews", "Create landing page", "Build email list", "Set up analytics"],
      "tools": ["Figma", "Notion", "Google Analytics", "Typeform"],
      "tutorials": ["How to validate startup ideas", "User interview best practices", "Landing page optimization"],
      "mistakes": ["Skipping user research", "Building too many features", "Ignoring feedback", "Poor time management"]
    },
    {
      "month": 2,
      "phase": "MVP Development",
      "goals": ["Core features", "AI integration", "Basic UI/UX", "Database setup"],
      "status": "current",
      "tasks": ["Build authentication", "Integrate AI API", "Design UI", "Setup database"],
      "tools": ["VS Code", "GitHub", "MongoDB", "Postman"],
      "tutorials": ["Building MVPs fast", "AI integration guide", "Database design"],
      "mistakes": ["Over-engineering", "Perfectionism", "No testing", "Scope creep"]
    },
    {
      "month": 3,
      "phase": "Beta Testing",
      "goals": ["User testing", "Bug fixes", "Feedback collection", "Iterate features"],
      "status": "upcoming",
      "tasks": ["Recruit beta testers", "Fix critical bugs", "Collect feedback", "Improve UX"],
      "tools": ["TestFlight", "Hotjar", "Intercom", "Sentry"],
      "tutorials": ["Beta testing strategies", "User feedback analysis", "Bug tracking"],
      "mistakes": ["Ignoring user feedback", "Too many features", "No metrics", "Poor communication"]
    },
    {
      "month": 4,
      "phase": "Launch Preparation",
      "goals": ["Marketing materials", "Landing page", "Social media", "Press kit"],
      "status": "upcoming",
      "tasks": ["Create pitch deck", "Build landing page", "Setup social accounts", "Write press release"],
      "tools": ["Canva", "Webflow", "Buffer", "Mailchimp"],
      "tutorials": ["Product launch checklist", "Marketing strategies", "PR basics"],
      "mistakes": ["Launching too early", "No marketing plan", "Poor messaging", "No follow-up"]
    },
    {
      "month": 5,
      "phase": "Public Launch",
      "goals": ["Product Hunt launch", "Email campaign", "Influencer outreach", "Monitor metrics"],
      "status": "upcoming",
      "tasks": ["Launch on Product Hunt", "Send email blast", "Contact influencers", "Track analytics"],
      "tools": ["Product Hunt", "Mailchimp", "Twitter", "Google Analytics"],
      "tutorials": ["Product Hunt success guide", "Email marketing", "Growth hacking"],
      "mistakes": ["No launch plan", "Poor timing", "No community", "Ignoring metrics"]
    },
    {
      "month": 6,
      "phase": "Growth & Scale",
      "goals": ["User acquisition", "Feature expansion", "Team hiring", "Funding round"],
      "status": "upcoming",
      "tasks": ["Run ads", "Add features", "Hire developers", "Pitch investors"],
      "tools": ["Google Ads", "LinkedIn", "AngelList", "Crunchbase"],
      "tutorials": ["Scaling startups", "Hiring guide", "Fundraising basics"],
      "mistakes": ["Scaling too fast", "Wrong hires", "Burning cash", "Losing focus"]
    }
  ]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const roadmap = cleanAndParseJSON(aiResponse);

    console.log('✅ Roadmap generated');

    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error('❌ Error generating roadmap:', error);
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

    console.log('💰 Analyze Funding Request:', ideaData?.name);

    const prompt = `Analyze funding for: ${ideaData.name}

Return ONLY valid JSON (no markdown):
{
  "readiness": {
    "score": 72,
    "summary": "Getting close but need more traction",
    "metrics": [
      {"name": "Market Validation", "score": 85, "status": "good"},
      {"name": "Team Strength", "score": 65, "status": "medium"},
      {"name": "Revenue Model", "score": 78, "status": "good"},
      {"name": "Traction", "score": 45, "status": "poor"},
      {"name": "Competitive Edge", "score": 82, "status": "good"}
    ]
  },
  "sources": [
    {"type": "Bootstrapping", "amount": "$0-50K", "timeline": "Immediate", "difficulty": "Easy", "fit": 85},
    {"type": "Angel Investors", "amount": "$50K-500K", "timeline": "3-6 months", "difficulty": "Medium", "fit": 72},
    {"type": "Venture Capital", "amount": "$500K-5M", "timeline": "6-12 months", "difficulty": "Hard", "fit": 45},
    {"type": "Accelerators", "amount": "$25K-150K", "timeline": "3-4 months", "difficulty": "Medium", "fit": 88}
  ],
  "projections": [
    {"year": "Year 1", "revenue": "$50K", "users": "500", "mrr": "$4K"},
    {"year": "Year 2", "revenue": "$250K", "users": "2.5K", "mrr": "$21K"},
    {"year": "Year 3", "revenue": "$1M", "users": "10K", "mrr": "$83K"},
    {"year": "Year 4", "revenue": "$3.5M", "users": "35K", "mrr": "$291K"},
    {"year": "Year 5", "revenue": "$10M", "users": "100K", "mrr": "$833K"}
  ],
  "investorFeedback": [
    {"type": "Shark Tank Investor", "feedback": "The market is huge, but you're too early. Come back when you have 10K paying users and $50K MRR.", "rating": 6},
    {"type": "YC Partner", "feedback": "Interesting problem, but the solution isn't 10x better. What's your unfair advantage?", "rating": 7},
    {"type": "Angel Investor", "feedback": "I like the team and vision. Show me user retention data and I'm interested.", "rating": 8}
  ],
  "pitchDeckSections": ["Problem", "Solution", "Market Size", "Business Model", "Traction", "Competition", "Team", "Financials", "Ask", "Vision"]
}`;

    const aiResponse = await generateAIResponse(prompt);
    const funding = cleanAndParseJSON(aiResponse);

    console.log('✅ Funding analysis complete');

    res.status(200).json({
      success: true,
      data: funding,
    });
  } catch (error) {
    console.error('❌ Error analyzing funding:', error);
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

    console.log('💬 Chat with Cofounder:', message.substring(0, 50));

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

${conversationContext ? `Previous conversation: ${conversationContext}` : ''}User message: ${message}

Provide helpful, actionable advice. Be encouraging but realistic.

IMPORTANT: Return ONLY valid JSON. Do not include newlines or special characters in strings. Use spaces instead.

Format:
{"message":"Your response in one line","suggestions":["Action 1","Action 2","Action 3"]}`;

    const aiResponse = await generateAIResponse(prompt);
    const response = cleanAndParseJSON(aiResponse);

    console.log('✅ Chat response generated');

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('❌ Error in cofounder chat:', error);
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
