import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

// Email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength regex: min 8 chars, 1 letter, 1 number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Basic presence check
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2. Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // 3. Validate username (length and no special chars)
    if (username.length < 3 || username.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be 3–20 characters long." });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res
        .status(400)
        .json({
          message:
            "Username can only contain letters, numbers, and underscores.",
        });
    }

    // 4. Validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one letter and one number.",
      });
    }

    // 5. Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // 8. Return response
    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Error in register controller:", err.message);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 2. Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // 3. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 5. Generate token and set cookie
    const token = generateTokenAndSetCookie(user, res);

    // 6. Return response (omit sensitive info)
    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in login controller:", err.message);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

// Get user profile (protected route)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log("error in get profile controller ", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//logout controller
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.log("error in logout controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all users 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username email _id createdAt').sort({ username: 1 });
    res.status(200).json({ users });
  } catch (err) {
    console.log("error in get all users controller", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
