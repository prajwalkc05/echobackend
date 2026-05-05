import User from "../auth/auth.model.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
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
        profile: {
          interests: interests || [],
          goals: goals || [],
          education: education || '',
          skills: skills || [],
          learningStyle: learningStyle || '',
          onboardingCompleted: true,
        },
      },
      { new: true, select: "-password" }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
