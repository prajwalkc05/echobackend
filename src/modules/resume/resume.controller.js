import Resume from "./resume.model.js";
import { generateResumeAI } from "./resume.service.js";
import { calculateATSScore } from "./ats.service.js";
import { templateMap, defaultTemplate } from "../../templates/index.js";
import { generatePDF } from "../../utils/pdfGenerator.js";

export const createAIResume = async (req, res) => {
  try {
    const { name, skills, experience, jobDescription, template } = req.body;
    const aiContent = await generateResumeAI({ name, skills, experience, jobDescription });

    const resume = await Resume.create({
      userId: req.user._id,
      title: "AI Resume",
      template: template || "t1",
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
    const { title, content, template } = req.body;
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      content,
      template: template || "t1",
      aiGenerated: false,
    });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const templateFn = templateMap[resume.template] || defaultTemplate;
    const html = templateFn(resume.content || {});
    const pdfBuffer = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const previewResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const templateFn = templateMap[resume.template] || defaultTemplate;
    res.setHeader("Content-Type", "text/html");
    res.send(templateFn(resume.content || {}));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const base64 = req.file.buffer.toString("base64");
    const photoUrl = `data:${req.file.mimetype};base64,${base64}`;
    resume.photo = photoUrl;
    resume.content = { ...resume.content, photo: photoUrl };
    await resume.save();

    res.json({ success: true, message: "Photo uploaded" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getATSScore = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const { jobDescription } = req.body;
    const score = calculateATSScore(resume.content, jobDescription);

    res.json({
      score,
      message: score > 70 ? "✅ Good match" : score > 40 ? "⚠️ Improve keywords" : "❌ Low match — add more relevant keywords",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
