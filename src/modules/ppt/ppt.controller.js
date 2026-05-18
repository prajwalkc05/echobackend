import { generateSlidesWithImages, createPPT } from "./ppt.service.js";
import PPT from "./ppt.model.js";

// New endpoint: returns JSON slides for frontend renderer (SlideAI platform)
export const generateSlidesJSON = async (req, res) => {
  try {
    const {
      topic,
      slideContent,
      description,
      slideCount = 10,
      presentationType = "business",
      tone = "professional",
      audience = "general",
      theme = "future-neon",
    } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const slides = await generateSlidesWithImages(topic, slideCount, presentationType, tone, audience);

    if (!slides.length) {
      return res.status(500).json({ error: "Failed to generate slides" });
    }

    // Save record with all details
    await PPT.create({ 
      userId: req.user._id, 
      topic, 
      description,
      slideContent,
      slides: slideCount, 
      theme, 
      presentationType,
      tone,
      audience,
      layout: "ai-json" 
    });

    res.json({ slides, theme, title: topic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Existing endpoint: generates and downloads .pptx file
export const generatePPT = async (req, res) => {
  try {
    const { topic, slides = 5, theme = "light", layout = "titleContent" } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const slidesData = await generateSlidesWithImages(topic, slides);

    if (!slidesData.length) {
      return res.status(500).json({ error: "Failed to generate slide content" });
    }

    const pptBuffer = await createPPT(slidesData, theme, layout);

    const record = await PPT.create({ userId: req.user._id, topic, slides, theme, layout });

    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename=${topic.replace(/\s+/g, "_")}.pptx`,
      "X-PPT-ID": record._id.toString(),
    });

    res.send(pptBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPPTHistory = async (req, res) => {
  try {
    const history = await PPT.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('topic description slideContent slides theme presentationType tone audience createdAt');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
