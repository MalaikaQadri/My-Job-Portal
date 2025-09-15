const { User } = require('../models')
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken')

// ------------------
const googleCallback = async (req, res) => {
  try {
    // req.user comes from passport.deserializeUser (user object from DB)
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found after Google login" });
    }

    const token = generateToken(user);

    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  } catch (error) {
    console.error("Error in googleCallback:", error.message);
    res.status(500).json({ message: "Server error in Google OAuth callback" });
  }
};

module.exports = {googleCallback}





// const googleCallback = async (req, res) => {

  
//   const  user = await User.findByPk(req.user.id);
// if (!user) {
//   return res.redirect("http://localhost:3000/login?error=UserNotFound");
// }

//     const token = generateToken(req.user);

//   res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
//   // const successURL = `${process.env.CLIENT_URL}/oauth-success?token=${token}`
//   // res.redirect(successURL)

// };


// exports.linkedinCallback = (req, res) => {
//   const token = jwt.sign(
//     { id: req.user.id, email: req.user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: '1d' }
//   );
    // const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
// 
//   res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
// };

// const successURL = `${process.env.CLIENT_URL}/oauth-success?token=${token}`;
// res.redirect(successURL);
