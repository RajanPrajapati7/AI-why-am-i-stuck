import { UserPattern } from '../models/UserPattern.js';
import { recalculateUserPatterns } from '../services/analyticsService.js';

export const getUserPatterns = async (req, res, next) => {
  try {
    let patterns = await UserPattern.findOne({ userId: req.user._id });

    if (!patterns) {
      patterns = await recalculateUserPatterns(req.user._id);
    }

    res.status(200).json({
      success: true,
      patterns,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserPatterns = async (req, res, next) => {
  try {
    const patterns = await recalculateUserPatterns(req.user._id);

    res.status(200).json({
      success: true,
      patterns,
    });
  } catch (error) {
    next(error);
  }
};
