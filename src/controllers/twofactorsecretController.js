const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { User } = require("../models");

// Enable 2FA (Generate Secret + QR Code) 
const enable2FA = async (req, res) => {
  try {
    console.log(req.user)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    // const userId = req.user.id;

    const userId = req.user.id; // assuming user is authenticated
    const secret = speakeasy.generateSecret({
      name: "Job Portal (2FA)",
    });
    // Save secret in DB
    let twoFactor = await TwoFactorSecret.findOne({ where: { userId } });
    if (!twoFactor) {
      twoFactor = await TwoFactorSecret.create({
        userId,
        secret: secret.base32,
         is2FAEnabled: true,
      });
    } else {
      await twoFactor.update({
        secret: secret.base32,
         is2FAEnabled: true,
      });
    }

     //  Update Users table too
    await User.update(
      { is2FAEnabled: true },
      { where: { id: userId } }
    );

    // Generate QR Code for user to scan
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      message: "2FA enabled successfully",
      qrCode: qrCodeDataURL,
      secret: secret.base32, // you can hide this in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
};

//  Verify 2FA Token (when logging in)
const verify2FA = async (req, res) => {
  try {
     if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { token } = req.body;
    const userId = req.user.id;

    const twoFactor = await TwoFactorSecret.findOne({ where: { userId } });
    if (!twoFactor || !twoFactor.isEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: "base32",
      token,
      window: 1, // allow ±30s clock drift
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ message: "2FA verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
};

//  Disable 2FA
const disable2FA = async (req, res) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

     const deleted = await TwoFactorSecret.destroy({ where: { userId } });

    if (!deleted) {
      return res.status(404).json({ message: "No 2FA found for this user" });
    }
   await User.update(
  { is2FAEnabled: false },
  { where: { id: userId } }
);
    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
};

module.exports = { enable2FA, verify2FA, disable2FA }

