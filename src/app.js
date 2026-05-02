import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

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

app.use("/api/ai", aiLimiter);
app.use("/api", routes);

export default app;