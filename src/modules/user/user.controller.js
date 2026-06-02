import bcrypt from "bcryptjs";
import User from "../auth/auth.model.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(profile && { profile }) },
      { returnDocument: "after", select: "-password" }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveOnboarding = async (req, res) => {
  try {
    const { interests, goals, education, skills, learningStyle } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.interests': interests || [],
          'profile.goals': goals || [],
          'profile.education': education || '',
          'profile.skills': skills || [],
          'profile.learningStyle': learningStyle || '',
          'profile.onboardingCompleted': true,
        },
      },
      { returnDocument: 'after', select: '-password' }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveCourseOnboarding = async (req, res) => {
  try {
    const { careerGoal, interests, learningStyle, skillLevel, mainGoal } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.careerGoal': careerGoal || '',
          'profile.interests': interests || [],
          'profile.learningStyle': learningStyle || '',
          'profile.skillLevel': skillLevel || '',
          'profile.mainGoal': mainGoal || '',
          'profile.courseOnboardingCompleted': true,
        },
      },
      { returnDocument: 'after', select: '-password' }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required' });
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    res.json({ success: true, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSessions = async (req, res) => {
  // Returns the current active session info derived from the JWT
  const token = req.headers.authorization?.split(' ')[1];
  res.json({
    success: true,
    sessions: [{
      id: 'current',
      device: req.headers['user-agent'] || 'Unknown device',
      ip: req.ip,
      current: true,
      createdAt: new Date(),
    }],
  });
};

export const getPrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privacy cookies');
    res.json({ success: true, privacy: user.privacy, cookies: user.cookies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePrivacy = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { privacy: req.body } },
      { returnDocument: 'after', select: 'privacy' }
    );
    res.json({ success: true, privacy: updated.privacy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCookies = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cookies: req.body } },
      { returnDocument: 'after', select: 'cookies' }
    );
    res.json({ success: true, cookies: updated.cookies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Google users have no password — skip password check
    if (!user.isGoogleUser) {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Password is required' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Incorrect password' });
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push, reminders } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'notifications.email': email !== undefined ? email : undefined,
          'notifications.push': push !== undefined ? push : undefined,
          'notifications.reminders': reminders !== undefined ? reminders : undefined,
        }
      },
      { returnDocument: 'after', select: '-password' }
    );
    res.json({ success: true, notifications: updated.notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
