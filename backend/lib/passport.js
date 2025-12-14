import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      // PASTE YOUR KEYS DIRECTLY HERE INSIDE QUOTES:
    
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists but has no googleId (linked to password account), update it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.image = profile.photos[0].value; // update image
            user.isVerified = true; // Trust Google emails
            await user.save();
          }
          return done(null, user);
        }

        // 2. If no user, create a new one
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          googleId: profile.id,
         
          isVerified: true, // Google users are automatically verified
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;