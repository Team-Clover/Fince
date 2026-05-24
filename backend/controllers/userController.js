import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import generateToken from "../config/utils.js";
import { z } from "zod";
import {
  sendLoginEmail,
  sendRegistrationEmail,
  sendEmail,
} from "../config/email.js";

// In-memory OTP store (production should use Redis/DB)
const otpStore = new Map();

// Signup a new user
export const registerUserController = async (req, res) => {
  const { fullName, email, password, phone, userMode } = req.body;
  try {
    if (!fullName || !email || !password || !phone) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        success: false,
        message: "Account already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      userMode: userMode || "individual",
      familyCode,
    });

    const token = generateToken(newUser._id);

    // Send registration notification email in background (don't block signup)
    sendRegistrationEmail(newUser.email, newUser.fullName).catch((err) =>
      console.error("Registration email failed (non-blocking):", err.message)
    );

    // Don't return password hash in response
    const safeUser = newUser.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      userData: safeUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login a user
export const loginUserController = async (req, res) => {
  try {
    // Validate request body using Zod
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.json({
        success: false,
        message: parseResult.error.errors.map((e) => e.message).join(", "),
      });
    }
    const { email, password } = parseResult.data;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(userData._id);

    // Send login notification email in background (don't block login)
    sendLoginEmail(userData.email, userData.fullName).catch((err) =>
      console.error("Login email failed (non-blocking):", err.message)
    );

    // Don't return password hash in response
    const safeUser = userData.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      userData: safeUser,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, password, username } = req.body;
    const userId = req.user._id;

    // Build the update object with only provided fields
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (phone) updateFields.phone = phone.trim();
    if (username) updateFields.username = username.trim();

    // Handle password separately (hash it)
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, select: "-password" }, // never return password hash
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to logout a user
export const logoutUserController = async (req, res) => {
  try {
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Link Family Group
export const linkFamily = async (req, res) => {
  const { familyCode } = req.body;
  try {
    if (!familyCode) {
      return res.json({ success: false, message: "Family code is required" });
    }

    const cleanCode = familyCode.trim().toUpperCase();

    // Check if code exists on any user
    const codeExists = await User.findOne({ familyCode: cleanCode });
    if (!codeExists) {
      return res.json({
        success: false,
        message: "Family code not found. Make sure another member has it.",
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { familyCode: cleanCode },
      { new: true },
    );

    res.json({
      success: true,
      message: `Successfully linked to family group ${cleanCode}`,
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Leave Family Group
export const leaveFamily = async (req, res) => {
  try {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { familyCode: newCode },
      { new: true },
    );

    res.json({
      success: true,
      message: "Successfully left family group. New private code generated.",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login/register with wallet address
export const walletLoginController = async (req, res) => {
  const { walletAddress } = req.body;
  try {
    if (!walletAddress) {
      return res.json({
        success: false,
        message: "Wallet address is required",
      });
    }

    const cleanAddress = walletAddress.trim().toLowerCase();

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return res.json({
        success: false,
        message: "Invalid Ethereum wallet address format",
      });
    }

    // Find existing user by walletAddress
    let user = await User.findOne({ walletAddress: cleanAddress });

    if (user) {
      const token = generateToken(user._id);
      const safeUser = user.toObject();
      delete safeUser.password;
      return res.json({
        success: true,
        userData: safeUser,
        token,
        message: "Logged in via wallet successfully",
      });
    }

    // If no user exists, register them
    const mockEmail = `wallet_${cleanAddress}@fince.com`;
    const emailUser = await User.findOne({ email: mockEmail });
    if (emailUser) {
      // Link wallet to existing email user and login
      emailUser.walletAddress = cleanAddress;
      await emailUser.save();
      const token = generateToken(emailUser._id);
      const safeUser = emailUser.toObject();
      delete safeUser.password;
      return res.json({
        success: true,
        userData: safeUser,
        token,
        message: "Logged in via wallet successfully",
      });
    }

    // Create new wallet user
    const salt = await bcrypt.genSalt(10);
    const randomPassword =
      Math.random().toString(36) + Math.random().toString(36);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const shortAddress = `${cleanAddress.substring(0, 6)}...${cleanAddress.slice(-4)}`;
    // Allow userMode to be set from request body, default to individual
    const userMode = req.body.userMode || "individual";
    const newUser = await User.create({
      fullName: `Wallet User (${shortAddress})`,
      email: mockEmail,
      password: hashedPassword,
      phone: "0000000000",
      userMode,
      familyCode,
      walletAddress: cleanAddress,
    });

    const token = generateToken(newUser._id);

    const safeUser = newUser.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      userData: safeUser,
      token,
      message: "Wallet account registered successfully",
    });
  } catch (error) {
    console.error("Wallet login error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ── Forgot Password: Step 1 — Request OTP ─────────────────────────────────
export const forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: "No account found with this email" });
    }

    // Mask phone: show "91" prefix + "****" + last 2 digits
    const phone = user.phone || "";
    let maskedPhone = "Not available";
    if (phone.length >= 4) {
      maskedPhone = `91******${phone.slice(-2)}`;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10-minute expiry
    otpStore.set(email.trim().toLowerCase(), {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via email
    await sendEmail(
      email,
      "Fince Password Reset OTP",
      `Hi ${user.fullName},\n\nYour password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nFince Team`
    );

    return res.json({
      success: true,
      maskedPhone,
      message: "OTP sent to your registered email",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ── Forgot Password: Step 2 — Verify OTP ──────────────────────────────────
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    const stored = otpStore.get(email.trim().toLowerCase());
    if (!stored) {
      return res.json({ success: false, message: "No OTP request found. Please request a new one." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.trim().toLowerCase());
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (stored.otp !== otp.trim()) {
      return res.json({ success: false, message: "Invalid OTP. Please try again." });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// ── Forgot Password: Step 3 — Reset Password ─────────────────────────────
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Re-verify OTP
    const stored = otpStore.get(email.trim().toLowerCase());
    if (!stored || Date.now() > stored.expiresAt || stored.otp !== otp.trim()) {
      return res.json({ success: false, message: "Invalid or expired OTP. Please restart." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { password: hashedPassword }
    );

    // Clear OTP
    otpStore.delete(email.trim().toLowerCase());

    return res.json({ success: true, message: "Password reset successfully! You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
