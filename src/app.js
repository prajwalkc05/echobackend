import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many AI requests, please wait a minute." },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EchoMentor API Running 🚀");
});

app.get("/docs", (req, res) => {
  res.json({
    name: "EchoMentor API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: ["/api/auth/signup", "/api/auth/login", "/api/auth/google"],
      ai: ["/api/ai/chat", "/api/ai/history", "/api/ai/extract"],
      user: ["/api/user/profile"],
      subscription: ["/api/subscription/plans", "/api/subscription/create-order", "/api/subscription/verify-payment"],
      studyPlanner: ["/api/study-planner/generate"],
      resume: ["/api/resume/ai", "/api/resume/manual"],
      mood: ["/api/mood/track", "/api/mood/history"],
      opportunities: ["/api/opportunities/"],
      code: ["/api/code/assist"],
      ppt: ["/api/ppt/generate"],
    }
  });
});

app.use("/api/ai/chat", aiLimiter);
app.use("/api", routes);

export default app;