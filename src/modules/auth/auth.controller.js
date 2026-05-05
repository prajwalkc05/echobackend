import { registerUser, loginUser, googleAuthUser } from "./auth.service.js";

export const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body.email, req.body.password);
    res.json({ message: "Login successful", ...data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const data = await googleAuthUser({ name, email });
    res.json({ message: "Google auth successful", ...data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
