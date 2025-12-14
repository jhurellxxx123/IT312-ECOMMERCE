import express from "express";
import { 
  login, 
  logout, 
  signup, 
  refreshToken, 
  getProfile, 
  verifyEmail, 
  googleAuthCallback 
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import passport from "../lib/passport.js"; // Import passport config we created

const router = express.Router();

// Existing
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

// --- NEW ROUTES ---

// 1. Email Verification
router.post("/verify-email", verifyEmail);

// 2. Google Login Trigger
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 3. Google Callback
// Passport middleware authenticates -> googleAuthCallback controller sets cookies & redirects
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthCallback
);

export default router;