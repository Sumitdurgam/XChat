const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  searchUsers,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', authMiddleware, logoutUser);
router.get('/me', authMiddleware, getUserProfile);
router.get('/search', authMiddleware, searchUsers);

module.exports = router;
