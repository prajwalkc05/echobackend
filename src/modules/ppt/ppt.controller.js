import { generateSlidesAI, createPPT } from "./ppt.service.js";
import PPT from "./ppt.model.js";

export const generatePPT = async (req, res) => {
  try {
    const { topic, slides = 5, theme = "light", layout = "titleContent" } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const slidesData = await generateSlidesAI(topic, slides);

    if (!slidesData.length) {
      return res.status(500).json({ error: "Failed to generate slide content" });
    }

    const pptBuffer = await createPPT(slidesData, theme, layout);

    // Save record to DB
    const record = await PPT.create({
      userId: req.user._id,
      topic,
      slides,
      theme,
      layout,
    });

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
    const history = await PPT.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
