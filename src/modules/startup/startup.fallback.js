// Fallback data generator when AI services fail
// Use this as a last resort to keep the app functional

export const generateFallbackIdeas = (problem, domain) => {
  const baseIdeas = {
    EdTech: [
      {
        id: `idea-${Date.now()}-1`,
        name: 'AI Study Companion',
        pitch: 'Personalized AI tutor that adapts to your learning style',
        problem: problem,
        demand: 88,
        competition: 52,
        revenue: 82,
        scalability: 91,
        confidence: 85
      },
      {
        id: `idea-${Date.now()}-2`,
        name: 'Smart Revision Planner',
        pitch: 'AI-powered study scheduler with spaced repetition',
        problem: problem,
        demand: 85,
        competition: 58,
        revenue: 78,
        scalability: 87,
        confidence: 82
      },
      {
        id: `idea-${Date.now()}-3`,
        name: 'Exam Prep Assistant',
        pitch: 'AI generates practice questions from your notes',
        problem: problem,
        demand: 90,
        competition: 45,
        revenue: 85,
        scalability: 93,
        confidence: 88
      }
    ],
    Healthcare: [
      {
        id: `idea-${Date.now()}-1`,
        name: 'MediRemind',
        pitch: 'Smart medication reminder with family alerts',
        problem: problem,
        demand: 92,
        competition: 48,
        revenue: 88,
        scalability: 95,
        confidence: 90
      },
      {
        id: `idea-${Date.now()}-2`,
        name: 'HealthTrack AI',
        pitch: 'AI-powered health monitoring for elderly care',
        problem: problem,
        demand: 89,
        competition: 55,
        revenue: 85,
        scalability: 91,
        confidence: 87
      },
      {
        id: `idea-${Date.now()}-3`,
        name: 'CareConnect',
        pitch: 'Connect elderly patients with remote caregivers',
        problem: problem,
        demand: 87,
        competition: 52,
        revenue: 82,
        scalability: 88,
        confidence: 84
      }
    ],
    FinTech: [
      {
        id: `idea-${Date.now()}-1`,
        name: 'InvestEasy',
        pitch: 'Simplified investing platform for beginners',
        problem: problem,
        demand: 91,
        competition: 62,
        revenue: 89,
        scalability: 94,
        confidence: 88
      },
      {
        id: `idea-${Date.now()}-2`,
        name: 'SmartSaver AI',
        pitch: 'AI analyzes spending and suggests savings',
        problem: problem,
        demand: 88,
        competition: 58,
        revenue: 85,
        scalability: 90,
        confidence: 86
      },
      {
        id: `idea-${Date.now()}-3`,
        name: 'WealthBuilder',
        pitch: 'Automated investment portfolio for young professionals',
        problem: problem,
        demand: 86,
        competition: 65,
        revenue: 87,
        scalability: 89,
        confidence: 83
      }
    ],
    default: [
      {
        id: `idea-${Date.now()}-1`,
        name: 'Problem Solver Pro',
        pitch: 'AI-powered solution for your specific challenge',
        problem: problem,
        demand: 85,
        competition: 50,
        revenue: 80,
        scalability: 88,
        confidence: 82
      },
      {
        id: `idea-${Date.now()}-2`,
        name: 'Smart Solution',
        pitch: 'Innovative approach to solving your problem',
        problem: problem,
        demand: 82,
        competition: 55,
        revenue: 78,
        scalability: 85,
        confidence: 80
      },
      {
        id: `idea-${Date.now()}-3`,
        name: 'AI Assistant',
        pitch: 'Intelligent system to address your needs',
        problem: problem,
        demand: 80,
        competition: 52,
        revenue: 75,
        scalability: 83,
        confidence: 78
      }
    ]
  };

  const ideas = baseIdeas[domain] || baseIdeas.default;
  
  const suggestions = [
    `AI-powered ${domain || 'solution'} platform`,
    `Smart ${problem.split(' ')[0]} assistant`,
    `Automated ${domain || 'problem'} solver`
  ];

  return { ideas, suggestions };
};

export const generateFallbackValidation = (ideaData) => {
  return {
    score: Math.floor(Math.random() * 20) + 75, // 75-95
    summary: `${ideaData.name} shows strong potential in the market with moderate competition. Focus on user acquisition and product-market fit.`,
    demandTrend: [
      { name: 'Jan', value: 65 },
      { name: 'Feb', value: 72 },
      { name: 'Mar', value: 78 },
      { name: 'Apr', value: 85 },
      { name: 'May', value: 92 }
    ],
    competitionAnalysis: [
      { subject: 'Innovation', A: 85, fullMark: 100 },
      { subject: 'Market Fit', A: 78, fullMark: 100 },
      { subject: 'Scalability', A: 92, fullMark: 100 },
      { subject: 'Revenue', A: 75, fullMark: 100 },
      { subject: 'Team', A: 68, fullMark: 100 }
    ],
    swot: {
      strengths: [
        'Strong market demand',
        'Innovative AI approach',
        'Scalable business model'
      ],
      weaknesses: [
        'High competition',
        'Requires significant investment',
        'Complex technology stack'
      ],
      opportunities: [
        'Growing market trend',
        'Potential partnerships',
        'Global expansion'
      ],
      threats: [
        'Established competitors',
        'Regulatory challenges',
        'Market saturation'
      ]
    },
    roast: [
      'Your idea needs more differentiation from existing solutions',
      'Market is crowded - what makes you 10x better?',
      'Revenue model needs more clarity',
      'Customer acquisition costs might be high',
      'Consider starting with a niche market first'
    ]
  };
};

export const generateFallbackMVP = (ideaData) => {
  return {
    techStacks: {
      frontend: ['React', 'Next.js', 'Vue.js', 'Angular'],
      backend: ['Node.js', 'Python/Django', 'Ruby on Rails', 'Go'],
      database: ['MongoDB', 'PostgreSQL', 'Firebase', 'Supabase'],
      ai: ['OpenAI API', 'Hugging Face', 'TensorFlow', 'Custom Model']
    },
    features: [
      { name: 'User Authentication', priority: 'High', effort: '2 weeks', status: 'core' },
      { name: 'Core AI Feature', priority: 'High', effort: '3 weeks', status: 'core' },
      { name: 'Dashboard', priority: 'High', effort: '2 weeks', status: 'core' },
      { name: 'Analytics', priority: 'Medium', effort: '1 week', status: 'nice' },
      { name: 'Mobile App', priority: 'Low', effort: '4 weeks', status: 'future' },
      { name: 'Social Features', priority: 'Low', effort: '2 weeks', status: 'future' }
    ],
    timeline: [
      { phase: 'Planning & Design', duration: '2 weeks', tasks: ['User research', 'Wireframes', 'Tech stack selection'] },
      { phase: 'Core Development', duration: '6 weeks', tasks: ['Auth system', 'AI integration', 'Database setup'] },
      { phase: 'Testing & Polish', duration: '2 weeks', tasks: ['Bug fixes', 'UI polish', 'Performance optimization'] },
      { phase: 'Beta Launch', duration: '1 week', tasks: ['Deploy', 'User feedback', 'Iterate'] }
    ],
    monetization: [
      { model: 'Freemium', revenue: '$5-15/mo', pros: 'Easy user acquisition', cons: 'Low conversion rate' },
      { model: 'Subscription', revenue: '$20-50/mo', pros: 'Predictable revenue', cons: 'Higher barrier to entry' },
      { model: 'Pay-per-use', revenue: 'Variable', pros: 'Flexible pricing', cons: 'Unpredictable revenue' }
    ],
    recommendedStack: ['React', 'Node.js', 'MongoDB', 'OpenAI API']
  };
};
