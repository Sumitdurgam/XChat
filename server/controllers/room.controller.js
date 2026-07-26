const Room = require('../models/room.model');

// 1. Initialize Chat Room
const initRoom = async (req, res) => {
  try {
    const { otheruser } = req.body;

    if (!otheruser) {
      return res.status(400).json({
        success: false,
        message: 'Other user is required to create a chat room',
      });
    }

    const currentUserId = req.user._id;

    // Check if room already exists between these two users
    let room = await Room.findOne({
      users: { $all: [currentUserId, otheruser] },
    }).populate('users', '-password');

    if (!room) {
      room = await Room.create({
        users: [currentUserId, otheruser],
      });
      room = await Room.findById(room._id).populate('users', '-password');
    }

    const formattedUsers = room.users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
    }));

    return res.status(200).json({
      success: true,
      data: {
        _id: room._id,
        users: formattedUsers,
      },
      message: 'Room initialized successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error initializing chat room',
    });
  }
};

// 2. Get User's Chat Rooms
const getUserRooms = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const rooms = await Room.find({
      users: currentUserId,
    }).populate('users', '-password');

    const formattedRooms = rooms.map((room) => ({
      _id: room._id,
      users: room.users.map((u) => ({
        _id: u._id,
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: formattedRooms,
      message: 'Rooms fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user rooms',
    });
  }
};

module.exports = {
  initRoom,
  getUserRooms,
};
