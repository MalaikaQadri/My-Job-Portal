
const generateToken = require('../utils/generateToken');

const googleCallbackJson = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found after Google login" });
    }

    const token = generateToken(user.toJSON());

    //  Respond in JSON (frontend saves token in localStorage)
    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error("Error in googleCallbackJson:", error.message);
    res.status(500).json({ message: "Server error in Google OAuth callback" });
  }
};

module.exports = { googleCallbackJson };







// const { User } = require('../models')
// const jwt = require('jsonwebtoken');
// const generateToken = require('../utils/generateToken')

// // ------------------
// const googleCallback = async (req, res) => {
//   try {

//     const user = req.user;

//     if (!user) {
//       return res.status(404).json({ message: "User not found after Google login" });
//     }

//     const token = generateToken(user);

//     res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
//   } catch (error) {
//     console.error("Error in googleCallback:", error.message);
//     res.status(500).json({ message: "Server error in Google OAuth callback" });
//   }
// };

// module.exports = {googleCallback}
