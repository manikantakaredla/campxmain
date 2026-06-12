import os
import re

auth_controller_path = r'c:\Users\manik\Music\campx final\server\controllers\authController.js'
with open(auth_controller_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_methods = """// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "Please provide Roll No or Employee ID" });
    }

    // Try finding by rollNumber (student) or employeeId (staff)
    const user = await User.findOne({
      $or: [
        { rollNumber: identifier.toUpperCase() },
        { employeeId: identifier.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user (needs new schema fields or use a separate collection, but we'll add to user dynamically if schema is flexible, or just use existing fields. Wait, mongoose schema might drop it. We'll add resetPasswordOTP and resetPasswordExpires)
    // To avoid schema strict errors without editing User.js immediately, we can use `findByIdAndUpdate` with `strict: false` or update schema.
    await User.findByIdAndUpdate(user._id, {
      $set: {
        resetPasswordOTP: otp,
        resetPasswordExpires: Date.now() + 3600000 // 1 hour
      }
    }, { strict: false });

    // Simulate email sending
    console.log(`\n================================`);
    console.log(`📧 OTP Email Simulation`);
    console.log(`To: ${user.email} (${user.name})`);
    console.log(`Subject: Your Password Reset OTP`);
    console.log(`OTP: ${otp}`);
    console.log(`================================\n`);

    res.status(200).json({
      success: true,
      message: "OTP sent to your registered email"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Error processing request" });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const user = await User.findOne({
      $or: [
        { rollNumber: identifier.toUpperCase() },
        { employeeId: identifier.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Since we used strict: false, we can access user._doc.resetPasswordOTP
    const storedOTP = user.get('resetPasswordOTP');
    const expiry = user.get('resetPasswordExpires');

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > expiry) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    user.set('resetPasswordOTP', undefined);
    user.set('resetPasswordExpires', undefined);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

"""

if "exports.forgotPassword" not in content:
    content += "\n" + new_methods
    with open(auth_controller_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added forgotPassword and resetPassword to authController.js")


auth_routes_path = r'c:\Users\manik\Music\campx final\server\routes\authRoutes.js'
with open(auth_routes_path, 'r', encoding='utf-8') as f:
    r_content = f.read()

if "forgotPassword" not in r_content:
    r_content = r_content.replace('const { registerUser, loginUser, getMe, logoutUser } = require("../controllers/authController");',
                                  'const { registerUser, loginUser, getMe, logoutUser, forgotPassword, resetPassword } = require("../controllers/authController");')
    r_content = r_content.replace('module.exports = router;',
                                  'router.post("/forgot-password", forgotPassword);\nrouter.post("/reset-password", resetPassword);\n\nmodule.exports = router;')
    with open(auth_routes_path, 'w', encoding='utf-8') as f:
        f.write(r_content)
    print("Added routes to authRoutes.js")
