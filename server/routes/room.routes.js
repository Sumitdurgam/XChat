const express = require('express');
const router = express.Router();
const { initRoom, getUserRooms } = require('../controllers/room.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/init', authMiddleware, initRoom);
router.get('/userrooms', authMiddleware, getUserRooms);

module.exports = router;
