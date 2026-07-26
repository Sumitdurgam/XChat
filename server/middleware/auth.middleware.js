const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Check cookie
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const parts = cookie.trim().split('=');
        if (parts.length >= 2) {
          const key = parts[0];
          const value = parts.slice(1).join('=');
          acc[key] = value;
        }
        return acc;
      }, {});
      if (cookies.accessToken) {
        token = cookies.accessToken;
      }
    }

    // Check Authorization header fallback
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else {
        token = req.headers.authorization;
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Request - No token provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretjwtkey12345'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }

    const userId = decoded._id || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
    });
  }
};

module.exports = authMiddleware;
