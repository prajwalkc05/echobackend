export const adminAuth = (req, res, next) => {
  if (req.user?.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};
