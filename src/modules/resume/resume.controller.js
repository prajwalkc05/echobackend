import Resume from "./resume.model.js";
import { generateResumeAI } from "./resume.service.js";

export const createAIResume = async (req, res) => {
  try {
    const { name, skills, experience, jobDescription } = req.body;
    const aiContent = await generateResumeAI({ name, skills, experience, jobDescription });

    const resume = await Resume.create({
      userId: req.user._id,
      title: "AI Resume",
      content: aiContent,
      aiGenerated: true,
    });

    res.json({ success: true, resumeId: resume._id, content: aiContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createManualResume = async (req, res) => {
  try {
    const { title, content } = req.body;
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      content,
      aiGenerated: false,
    });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
