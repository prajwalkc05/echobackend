import { registerUser, loginUser } from "./auth.service.js";

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
