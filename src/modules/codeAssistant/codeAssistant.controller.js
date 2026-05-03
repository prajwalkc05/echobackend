import CodeAssistant from "./codeAssistant.model.js";
import { runCodeAssistant } from "./codeAssistant.service.js";

export const codeAssist = async (req, res) => {
  try {
    const { action, input, language = "javascript" } = req.body;

    if (!action || !input) return res.status(400).json({ error: "action and input are required" });

    const validActions = ["generate", "explain", "debug", "review"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `action must be one of: ${validActions.join(", ")}` });
    }

    const output = await runCodeAssistant(action, input, language);
    await CodeAssistant.create({ userId: req.user._id, action, language, input, output });

    res.json({ success: true, action, language, output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCodeHistory = async (req, res) => {
  try {
    const history = await CodeAssistant.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
