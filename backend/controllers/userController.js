import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import generateToken from "../config/utils.js";

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

    return res.json({
      success: true,
      userData: newUser,
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
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    return res.json({
      success: true,
      userData,
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
    const { profilePic, phone, userMode, fullName } = req.body;

    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { phone, userMode, fullName },
        { new: true },
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, phone, userMode, fullName },
        { new: true },
      );
    }

    return res.json({ success: true, user: updatedUser });
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
      return res.json({ success: false, message: "Family code not found. Make sure another member has it." });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { familyCode: cleanCode },
      { new: true }
    );

    res.json({
      success: true,
      message: `Successfully linked to family group ${cleanCode}`,
      user
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
      { new: true }
    );

    res.json({
      success: true,
      message: "Successfully left family group. New private code generated.",
      user
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
