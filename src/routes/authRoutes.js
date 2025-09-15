const express = require('express');
const { registerUser, loginUser, getUserProfile } = require ('../controllers/authController');

const { authorize} = require('../middlewares/authMiddleware');
const { enable2FA, disable2FA, verify2FA } = require("../controllers/twofactorsecretController");
const { otpHandler, resetPassword } = require('../controllers/otpController');
const router = express.Router();

// Routes 
router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/profile',  getUserProfile);

// router.post('/logout', authorize, logoutUser);

// -----------
router.post('/otp', otpHandler);
router.post('/reset-password', resetPassword);


// forgot password routes
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);
// // email verification routes
// router.post('/email-verification/send-otp', sendOtp);
// router.post('/email-verification/verify-email', verifyEmailOtp);
// router.post('/email-verification/resend-otp', resendOtp);
// // 2fA routes

// Enable 2FA
router.post("/2fa/enable", authorize,  enable2FA);
// Verify 2FA
router.post("/2fa/verify", authorize, verify2FA);
// Disable 2FA
router.post("2fa/disable", authorize, disable2FA);

module.exports = router;

