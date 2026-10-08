import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback to Bearer token in headers if cookie is missing
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: No authentication token provided',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token invalid or expired',
    });
  }
};
