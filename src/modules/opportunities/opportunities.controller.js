import { fetchOpportunities } from "./opportunities.service.js";
import User from "../auth/auth.model.js";

export const getOpportunities = async (req, res) => {
  try {
    const { type, location } = req.query;
    const data = await fetchOpportunities({ type, location });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMatchedOpportunities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkills = user.profile?.skills || [];

    if (!userSkills.length) {
      return res.status(400).json({ error: "Add skills to your profile to get matched opportunities" });
    }

    const data = await fetchOpportunities({ skills: userSkills });
    res.json({ success: true, count: data.length, matchedSkills: userSkills, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bookmarkOpportunity = async (req, res) => {
  try {
    const { title, company, location, type, url, skills } = req.body;

    if (!url) return res.status(400).json({ error: "url is required" });

    const user = await User.findById(req.user._id);
    const alreadyBookmarked = (user.bookmarks || []).some(b => b.url === url);
    if (alreadyBookmarked) return res.status(400).json({ error: "Already bookmarked" });

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        bookmarks: {
          title: String(title || ""),
          company: String(company || ""),
          location: String(location || ""),
          type: String(type || ""),
          url: String(url || ""),
          skills: Array.isArray(skills) ? skills : [],
        },
      },
    });

    res.json({ success: true, message: "Bookmarked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, bookmarks: user.bookmarks || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { bookmarks: { _id: req.params.id } },
    });
    res.json({ success: true, message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
