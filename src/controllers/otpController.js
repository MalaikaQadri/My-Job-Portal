const { User } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const transporter = require('../config/transporter');


const generateOtp = () => (Math.floor(100000 + Math.random() * 900000)).toString();

const otpHandler = async (req, res) => {
  const { email, type, otpCode, newPassword, tempToken } = req.body;

  if (!email || !type) {
    return res.status(400).json({ message: 'Email and type are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });


    // k8t%-gey k8t%-gey
    // ----------  If OTP not present  SEND ----------

    if (!user.otpCode || user.otpType !== type || user.otpExpiresAt < new Date()) {
      const newOtp = generateOtp();
      user.otpCode = newOtp;
      user.otpType = type;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      user.otpVerifiedAt = null;
      await user.save();

      await transporter.sendMail({
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your OTP for ${type}`,
        html: `<p>Your OTP code is: <b>${newOtp}</b></p><p>This code expires in 10 minutes.</p>`
      });

      return res.status(200).json({ message: 'OTP sent successfully.' });
    }

    // ----------  If otpCode provided VERIFY ----------


    if (otpCode) {
      if (
        user.otpCode.toString() !== otpCode.toString() ||
        user.otpExpiresAt < new Date() ||
        user.otpType !== type
      ) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
      }

      user.otpVerifiedAt = new Date();
      user.otpCode = null;
      user.otpExpiresAt = null;

      let response = { message: 'OTP verified successfully.' };

      if (type === 'email_verification') {
        user.isEmailVerified = true;
      }

      if (type === 'password_reset') {
        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        user.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        response.tempToken = token;
      }

      await user.save();
      return res.status(200).json(response);
    }

    // ----------  If OTP exists and no otpCode  RESEND ----------
    const newOtp = generateOtp();
    user.otpCode = newOtp;
    user.otpType = type;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpVerifiedAt = null;
    await user.save();

    await transporter.sendMail({
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your OTP for ${type} (Resent)`,
      html: `<p>Your OTP code is: <b>${newOtp}</b></p><p>This code expires in 10 minutes.</p>`
    });

    return res.status(200).json({ message: 'OTP resent successfully.' });

  } catch (err) {
    console.error("OTP Handler Error:", err);
    res.status(500).json({ message: 'Server error while processing OTP.' });
  }
};



// const otpHandler = async (req, res) => {
//   const { email, type, action, otpCode } = req.body;

//   if (!email || !type || !action) {
//     return res.status(400).json({ message: 'Email, type, and action are required.' });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     //  Send OTP
//     if (action === 'send') {
//       if (user.otpCode && user.otpExpiresAt > new Date() && user.otpType === type) {
//         return res.status(200).json({ message: 'OTP already sent. Please check your email.' });
//       }

//       const newOtp = generateOtp();
//       user.otpCode = newOtp;
//       user.otpType = type;
//       user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
//       user.otpVerifiedAt = null;
//       user.otpType = type;

//       await user.save();

//       await user.reload();

//       console.log("after save - otpCode", user.otpCode);
//       console.log("after save - otpType", user.otpType);

      
//       await transporter.sendMail({
//         from: `"No Reply" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: `Your OTP for ${type}`,
//         html: `<p>Your OTP code is: <b>${newOtp}</b></p><p>This code expires in 10 minutes.</p>`
//       });

//       return res.status(200).json({ message: 'OTP sent successfully.' });
//     }

//       // Resend OTP
//    if (action === 'resend') {
 
//     const newOtp = generateOtp();
//     user.otpCode = newOtp;
//     user.otpType = type;
//     user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // reset expiry
//     user.otpVerifiedAt = null;

//     await user.save();

//     await transporter.sendMail({
//        from: `"No Reply" <${process.env.EMAIL_USER}>`,
//        to: user.email,
//        subject: `Your OTP for ${type}`,
//        html: `<p>Your new OTP code is: <b>${newOtp}</b></p><p>This code expires in 10 minutes.</p>`
//   });

//   return res.status(200).json({ message: 'OTP resent successfully.' });
// }

//     // Verify OTP
//     if (action === 'verify') {
//         console.log("DB OTP.", user.otpCode);
//         console.log("Incomming OTP", otpCode);
//         console.log("DB Expiry", user.otpExpiresAt);
//         console.log("Current Time", new Date());
//         console.log(" DB Type", user.otpType);
//         console.log("Incomming Type", type);
//       if (
//         !user.otpCode ||
//         user.otpCode.toString() !== otpCode.toString() ||
//         user.otpExpiresAt < new Date() ||
//         user.otpType !== type
//       ) {
//         return res.status(400).json({ message: 'Invalid or expired OTP.' });
//       }

//       user.otpVerifiedAt = new Date();
//       user.otpCode = null;
//       user.otpExpiresAt = null;

//       let response = { message: 'OTP verified successfully.' };

//       if (type === 'email_verification') {
//         user.isEmailVerified = true;
//       }

//       if (type === 'password_reset') {
//         const tempToken = crypto.randomBytes(32).toString('hex');
//         user.token = tempToken;
//         user.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
//         response.tempToken = tempToken;
//       }

//       await user.save();
//       return res.status(200).json(response);
//     }

//     res.status(400).json({ message: 'Invalid action type.' });
//   } catch (err) {
//     console.error("OTP Handler Error:", err);
//     res.status(500).json({ message: 'Server error while processing OTP.' });
//   }
// };


















// --------- Reset Password (after OTP verified)
const resetPassword = async (req, res) => {
  const { tempToken, newPassword } = req.body;

  if (!tempToken || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  try {
    const user = await User.findOne({ where: { token: tempToken } });
    if (!user || user.tokenExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.token = null;
    user.tokenExpiresAt = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};



module.exports = { otpHandler, resetPassword };