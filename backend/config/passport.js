import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

/**
 * Google OAuth2.0 Strategy Configuration
 * Allows users to sign in with their Google account
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, update last login
                    user.lastLogin = new Date();
                    await user.save();
                    return done(null, user);
                }

                // Check if user exists with same email (registered via email/password)
                const existingEmailUser = await User.findOne({
                    email: profile.emails[0].value
                });

                if (existingEmailUser) {
                    // Link Google account to existing user
                    existingEmailUser.googleId = profile.id;
                    existingEmailUser.avatar = existingEmailUser.avatar || profile.photos[0]?.value;
                    existingEmailUser.displayName = existingEmailUser.displayName || profile.displayName;
                    existingEmailUser.isVerified = true; // Google accounts are pre-verified
                    existingEmailUser.lastLogin = new Date();
                    await existingEmailUser.save();
                    return done(null, existingEmailUser);
                }

                // Create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    username: profile.displayName,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0]?.value,
                    isVerified: true, // Google accounts are pre-verified
                    role: "user", // Default role for new users
                    lastLogin: new Date()
                });

                return done(null, newUser);
            } catch (error) {
                console.error("Google OAuth error:", error);
                return done(error, null);
            }
        }
    )
);

// Serialize user for session (if using sessions)
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select("-password -otp -otpExpiry");
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;

