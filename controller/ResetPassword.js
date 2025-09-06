const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const resetPasswordTemplate = require("../utils/resetPasswordTemplate");

// Step 1: Generate reset token & send email
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Your email is not registered with us",
      });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    // Save token & expiry
    user.token = token;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    // Reset link
    const url = `https://upcodefrontend.netlify.app/update-password/${token}`;

    // Send email
    await mailSender(
      email,
      "Password Reset Link",
      resetPasswordTemplate(user.name, url)
    //   `Click here to reset your password: <a href="${url}">${url}</a>`
    );

    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully. Please check your inbox to reset your password.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset email",
    });
  }
};

// Step 2: Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check expiry
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired. Please regenerate your token.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password & clear token
    user.password = hashedPassword;
    user.token = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
    });
  }
};
