import StudyPlan from "./studyPlanner.model.js";
import { generateStudyPlanAI } from "./studyPlanner.service.js";

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
