const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// 1. Register User
const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password || 
        !fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedFullName = fullName.trim();

    // Check duplicate email
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Check duplicate username
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Avatar URL
    const avatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(trimmedFullName)}`;

    const user = await User.create({
      fullName: trimmedFullName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      avatar,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while registering the user',
    });
  }
};

// 2. Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || !email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist with this email',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    const accessToken = jwt.sign(
      { _id: user._id, id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'supersecretjwtkey12345',
      { expiresIn: '1d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        accessToken,
      },
      message: 'User logged in successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while logging in',
    });
  }
};

// 3. Logout User
const logoutUser = async (req, res) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'User logged out',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout process',
    });
  }
};

// 4. Get User Profile
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
      },
      message: 'User fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
    });
  }
};

// 5. Search Users
const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const regex = new RegExp(searchTerm.trim(), 'i');

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    }).select('-password');

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
    }));

    return res.status(200).json({
      success: true,
      data: formattedUsers,
      message: 'Users fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching users',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  searchUsers,
};
