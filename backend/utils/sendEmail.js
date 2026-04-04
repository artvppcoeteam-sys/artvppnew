import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Email Utility
 * Uses Nodemailer with Gmail SMTP
 *
 * IMPORTANT: For production, consider using:
 * - SendGrid, Mailgun, or AWS SES for better deliverability
 * - Gmail has daily sending limits (500/day for regular, 2000/day for Workspace)
 */

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS // Use App Password, not regular password
        }
    });
};

/**
 * Send Verification Email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} username - User's name
 */
export const sendVerificationEmail = async (email, token, username) => {
    try {
        const transporter = createTransporter();

        // Read and compile template
        const templatePath = path.join(__dirname, "../templates/verifyEmail.hbs");
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(templateSource);

        // Verification URL - using query param format for frontend route
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

        const htmlContent = template({
            username: username || "User",
            verificationUrl,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Email - ArtVPP",
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        throw new Error("Failed to send verification email");
    }
};

/**
 * Send OTP for Password Reset
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {string} username - User's name
 */
export const sendOtpEmail = async (email, otp, username, purpose = "password-reset") => {
    try {
        const transporter = createTransporter();

        // Choose template and subject based on purpose
        const isArtistVerification = purpose === "artist-verification";
        const templateFile = isArtistVerification ? "artistVerifyEmail.hbs" : "otpEmail.hbs";
        const subject = isArtistVerification
            ? "Verify Your Email - Artist Application - ArtVPP"
            : "Password Reset OTP - ArtVPP";

        // Read and compile template
        const templatePath = path.join(__dirname, "../templates/" + templateFile);
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(templateSource);

        const htmlContent = template({
            username: username || "User",
            otp,
            validMinutes: 10,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ OTP email sending failed:", error.message);
        throw new Error("Failed to send OTP email");
    }
};

/**
 * Send Welcome Email (after verification)
 * @param {string} email - Recipient email
 * @param {string} username - User's name
 */
export const sendArtistVerificationOtp = async (email, otp, username) => {
    try {
        const transporter = createTransporter();

        const templatePath = path.join(__dirname, "../templates/artistVerifyEmail.hbs");
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(templateSource);

        const htmlContent = template({
            username: username || "Artist",
            otp,
            validMinutes: 10,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Email - Artist Application - ArtVPP",
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Artist verification OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Artist verification OTP sending failed:", error.message);
        throw new Error("Failed to send artist verification OTP");
    }
};

/**
 * Send Welcome Email (after verification)
 * @param {string} email - Recipient email
 * @param {string} username - User's name
 */
export const sendWelcomeEmail = async (email, username) => {
    try {
        const transporter = createTransporter();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00a63d;">Welcome to ArtVPP! 🎨</h2>
                <p>Hi ${username},</p>
                <p>Your account has been verified successfully. You can now:</p>
                <ul>
                    <li>Browse amazing artworks from student artists</li>
                    <li>Add items to your cart and make purchases</li>
                    <li>Apply to become an artist and sell your creations</li>
                </ul>
                <p>Start exploring now!</p>
                <a href="${process.env.CLIENT_URL}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #00a63d; 
                          color: white; text-decoration: none; border-radius: 5px;">
                    Visit ArtVPP
                </a>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    © ${new Date().getFullYear()} ArtVPP. All rights reserved.
                </p>
            </div>
        `;

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Welcome to ArtVPP! 🎨",
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Welcome email sending failed:", error.message);
        // Don't throw - welcome email is not critical
        return false;
    }
};

/**
 * Send Artist Request Status Email
 * @param {string} email - Recipient email
 * @param {string} username - User's name
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} reason - Rejection reason (if rejected)
 */
export const sendArtistStatusEmail = async (email, username, status, reason = null) => {
    try {
        const transporter = createTransporter();

        const isApproved = status === "approved";
        const subject = isApproved
            ? "🎉 Your Artist Application is Approved!"
            : "Artist Application Update";

        const htmlContent = isApproved
            ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #00a63d;">Congratulations! 🎨</h2>
                    <p>Hi ${username},</p>
                    <p>Great news! Your artist application has been <strong>approved</strong>!</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Upload your artworks</li>
                        <li>Set prices and manage inventory</li>
                        <li>Receive orders from buyers</li>
                    </ul>
                    <a href="${process.env.CLIENT_URL}/dashboard/artist" 
                       style="display: inline-block; padding: 12px 24px; background-color: #00a63d; 
                              color: white; text-decoration: none; border-radius: 5px;">
                        Go to Artist Dashboard
                    </a>
                </div>
            `
            : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e53e3e;">Application Not Approved</h2>
                    <p>Hi ${username},</p>
                    <p>We've reviewed your artist application, and unfortunately we're unable to approve it at this time.</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
                    <p>You can apply again after addressing the feedback. If you have questions, please contact support.</p>
                </div>
            `;

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Artist status email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Artist status email sending failed:", error.message);
        return false;
    }
};

/**
 * Send Artist Action Email (product/profile updates)
 * @param {string} email - Recipient email
 * @param {string} username - User's name
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} actionType - Type of action
 * @param {string} message - Custom message or reason
 */
export const sendArtistActionEmail = async (email, username, status, actionType, message = null) => {
    try {
        const transporter = createTransporter();

        const isApproved = status === "approved";

        const actionLabels = {
            create_product: "Product Submission",
            edit_product: "Product Edit Request",
            delete_product: "Product Deletion Request",
            edit_profile: "Profile Update Request"
        };

        const actionLabel = actionLabels[actionType] || "Request";

        const subject = isApproved
            ? `✅ ${actionLabel} Approved - ArtVPP`
            : `❌ ${actionLabel} Not Approved - ArtVPP`;

        const htmlContent = isApproved
            ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #00a63d;">Request Approved! ✅</h2>
                    <p>Hi ${username},</p>
                    <p>Your <strong>${actionLabel.toLowerCase()}</strong> has been approved.</p>
                    ${message ? `<p>${message}</p>` : ""}
                    <a href="${process.env.CLIENT_URL}/dashboard/artist" 
                       style="display: inline-block; padding: 12px 24px; background-color: #00a63d; 
                              color: white; text-decoration: none; border-radius: 5px;">
                        Go to Dashboard
                    </a>
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        © ${new Date().getFullYear()} ArtVPP. All rights reserved.
                    </p>
                </div>
            `
            : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e53e3e;">Request Not Approved</h2>
                    <p>Hi ${username},</p>
                    <p>Your <strong>${actionLabel.toLowerCase()}</strong> was not approved.</p>
                    ${message ? `<p><strong>Reason:</strong> ${message}</p>` : ""}
                    <p>Please review the feedback and try again. If you have questions, contact support.</p>
                    <a href="${process.env.CLIENT_URL}/dashboard/artist" 
                       style="display: inline-block; padding: 12px 24px; background-color: #4a5568; 
                              color: white; text-decoration: none; border-radius: 5px;">
                        Go to Dashboard
                    </a>
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        © ${new Date().getFullYear()} ArtVPP. All rights reserved.
                    </p>
                </div>
            `;

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Artist action email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Artist action email sending failed:", error.message);
        return false;
    }
};

/**
 * Send Suggestion Email to Artist Applicant
 * @param {string} email - Recipient email
 * @param {string} username - User's name
 * @param {string} suggestion - Suggestion/feedback text
 */
export const sendSuggestionEmail = async (email, username, suggestion) => {
    try {
        const transporter = createTransporter();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">Feedback on Your Artist Application 📝</h2>
                <p>Hi ${username},</p>
                <p>Our team has reviewed your artist application and has some feedback for you:</p>
                <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; color: #333; white-space: pre-wrap;">${suggestion}</p>
                </div>
                <p>Please address the feedback above to improve your application. You can update your application by visiting your profile.</p>
                <a href="${process.env.CLIENT_URL}/sell" 
                   style="display: inline-block; padding: 12px 24px; background-color: #D4AF37; 
                          color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    View Application
                </a>
                <p style="margin-top: 20px; color: #666;">
                    If you have any questions, please don't hesitate to contact our support team.
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    © ${new Date().getFullYear()} ArtVPP. All rights reserved.
                </p>
            </div>
        `;

        const mailOptions = {
            from: `"ArtVPP" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Feedback on Your Artist Application - ArtVPP",
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Suggestion email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Suggestion email sending failed:", error.message);
        return false;
    }
};

