import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hardcoded admin credentials (should be in environment variables in production)
const ADMIN_USERS = [
  {
    id: 'admin-1',
    email: 'admin@echomentor.com',
    password: '$2b$10$fjg4oZlHXbu5ZufEI5PBKuGm6ldoGopHN.nj9kIYACvuMDwpVM0cS', // password: admin123
    name: 'Admin User',
    role: 'super_admin'
  }
];

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin user
    const admin = ADMIN_USERS.find(u => u.email === email);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate admin token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No admin token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid admin token' });
  }
};
