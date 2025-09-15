const express = require('express');
const passport = require('../config/passport');
const { googleCallback } = require('../controllers/oauthaccountController');

const router = express.Router();

// GOOGLE
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// 🔹 Add an extra route for Postman testing:
router.get('/google/callback/json',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user.toJSON());
    res.json({ success: true, token, user: req.user });
  }
);


module.exports = router;

