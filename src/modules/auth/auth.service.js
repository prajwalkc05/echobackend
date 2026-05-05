import User from "./auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  const { password: _, ...userObj } = user.toObject();
  return userObj;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const { password: _, ...userObj } = user.toObject();
  return { user: userObj, token };
};

// Google OAuth — find or create user, return JWT
export const googleAuthUser = async ({ name, email }) => {
  let user = await User.findOne({ email });
  const isNewUser = !user;

  if (!user) {
    // Create new user without password (Google user)
    user = await User.create({ name, email, password: null });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const { password: _, ...userObj } = user.toObject();
  return { user: userObj, token, isNewUser };
};
