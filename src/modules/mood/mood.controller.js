import Mood from "./mood.model.js";
import { detectMoodAI, sendEmergencyAlert, getMoodSuggestion } from "./mood.service.js";
import { notifyUser } from "../../utils/notificationService.js";

export const trackMood = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const mood = await detectMoodAI(message);
    const suggestion = getMoodSuggestion(mood);
    const isAlert = mood === "sad" || mood === "anxious";

    await Mood.create({ userId: req.user._id, message, mood, alert: isAlert });

    if (isAlert) {
      await sendEmergencyAlert(req.user.email, req.user.name, mood, message);
      await notifyUser(req.user._id, `⚠️ We noticed you're feeling ${mood}. We're here for you. Stay strong!`, "mood", true);
    } else {
      await notifyUser(req.user._id, `😊 Mood logged: ${mood}. ${suggestion}`, "info");
    }

    res.json({ success: true, mood, suggestion, alert: isAlert ? "🚨 Emergency contact has been notified" : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const history = await Mood.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const moodCount = history.reduce((acc, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});

    res.json({ success: true, history, moodCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
