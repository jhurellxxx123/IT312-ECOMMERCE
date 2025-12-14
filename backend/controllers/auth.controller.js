import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// --- HELPER: GENERATE TOKENS ---
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// --- HELPER: STORE REFRESH TOKEN ---
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

// --- HELPER: SET COOKIES ---
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// --- HELPER: EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================================
// 1. SIGNUP (Now sends email instead of logging in)
// ==========================================
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({ 
      name, 
      email, 
      password,
      verificationToken,
      isVerified: false 
    });

    // Send Verification Email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your E-Commerce Account",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `
    });

    res.status(201).json({ 
      message: "Registration successful! Please check your email to verify your account." 
    });

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. VERIFY EMAIL (New Controller)
// ==========================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Automatically log user in after verification
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({ message: "Email verified successfully!" });

  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. LOGIN (Check for verification)
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if verified
      if (!user.isVerified) {
        return res.status(401).json({ message: "Please verify your email first." });
      }

      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("error in login controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. GOOGLE CALLBACK (Handle SSO Login)
// ==========================================
export const googleAuthCallback = async (req, res) => {
  try {
    // Req.user is populated by Passport before this runs
    const user = req.user; 
    
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    // Redirect to frontend with a success flag (tokens are in cookies)
    // We send a token in query param just to trigger the "success" page logic on frontend
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${accessToken}`);
    
  } catch (error) {
    console.log("Error in google callback", error.message);
    res.redirect(`${process.env.CLIENT_URL}/login`);
  }
};

export const logout = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    if (refresh_token) {
      const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout controller:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    if (!refresh_token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refresh_token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.json({ message: "token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};