const bcrypt = require('bcryptjs');
const { User  } = require('../models');
const speakeasy = require("speakeasy")
const generateToken = require('../utils/generateToken');
const { createEmailVerificationOtp } = require('./emailverificationController');

// Register new user
// POST /api/auth/register
const registerUser = async (req, res) => {
    const { fullName, username, email, password, role } = req.body;

    try {
      if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
    fullName,
    username,
    email,
    password: hashedPassword,
    role,
    });

    await createEmailVerificationOtp(user);

    const token = generateToken(user.toJSON());

    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, 
});

    res.status(201).json({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    token,
    });
    } 
    catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
    }
};

//  loginUser
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check 2FA enabled
     const twoFactor = await User.findOne({ where: { id: user.id } });
    if (twoFactor && twoFactor.isEnabled) {
      if (!token) {
        return res.status(403).json({ 
          message: "2FA code required", 
          require2FA: true 
        });
      }
      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid or expired 2FA code" });
      }
    }
    // Generate token
    const token = generateToken(user.toJSON());


    res.status(200).json({
      sucess: true,
    message: 'Login successful',
    user: {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
           },
           token: token,
    });
    } 
    catch (error) {
    console.error('Login Error:', error);
    console.error(error.stack);
    res.status(500).json({ message: 'Server error during login.' });
    }
};
// Logout user
// const logoutUser = (req, res) => {

//   // res.clearCookie('token', {
//   //   httpOnly: true,
//   //   secure: process.env.NODE_ENV === 'production',
//   //   sameSite: 'lax'
//   // });
//   res.status(200).json({ message: 'Logged out successfully' });
// };

// getuserprofile
const getUserProfile = async (req, res) => {
  try {
    console.log(req.user);
     if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User noooooot found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server errrrrrrrrrrror.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};


