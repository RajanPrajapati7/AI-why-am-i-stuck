import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });

  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (env.COOKIE_SAME_SITE || 'none') : 'lax',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: formatUserResponse(user),
  });
};

export const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  experienceLevel: user.experienceLevel,
  primaryTechStack: user.primaryTechStack || [],
  settings: user.settings || {
    appearance: 'dark',
    aiPreferences: {
      enableCognitiveCoaching: true,
      enableSocraticQuestioning: true,
    },
  },
  createdAt: user.createdAt,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  primaryTechStack: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters').optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  primaryTechStack: z.array(z.string().trim().min(1)).optional(),
});

export const updateSettingsSchema = z.object({
  appearance: z.enum(['system', 'dark', 'light']).optional(),
  aiPreferences: z
    .object({
      enableCognitiveCoaching: z.boolean().optional(),
      enableSocraticQuestioning: z.boolean().optional(),
    })
    .optional(),
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, experienceLevel, primaryTechStack } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Pre-save hook hashes this
      experienceLevel: experienceLevel || 'INTERMEDIATE',
      primaryTechStack: primaryTechStack || ['JavaScript', 'React', 'Node.js'],
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (env.COOKIE_SAME_SITE || 'none') : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: formatUserResponse(req.user),
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, experienceLevel, primaryTechStack } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name !== undefined) user.name = name;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (primaryTechStack !== undefined) user.primaryTechStack = primaryTechStack;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { appearance, aiPreferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.settings) {
      user.settings = {
        appearance: 'dark',
        aiPreferences: {
          enableCognitiveCoaching: true,
          enableSocraticQuestioning: true,
        },
      };
    }

    if (appearance !== undefined) {
      user.settings.appearance = appearance;
    }

    if (aiPreferences) {
      if (aiPreferences.enableCognitiveCoaching !== undefined) {
        user.settings.aiPreferences.enableCognitiveCoaching = aiPreferences.enableCognitiveCoaching;
      }
      if (aiPreferences.enableSocraticQuestioning !== undefined) {
        user.settings.aiPreferences.enableSocraticQuestioning = aiPreferences.enableSocraticQuestioning;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
