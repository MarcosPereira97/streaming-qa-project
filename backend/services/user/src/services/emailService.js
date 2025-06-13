const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Use production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use Ethereal for development
    return nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }
};

const transporter = createTransporter();

const emailService = {
  // Send verification email
  sendVerificationEmail: async (email, token) => {
    try {
      const verificationUrl = `${
        process.env.FRONTEND_URL || "http://localhost"
      }/verify-email?token=${token}`;

      const mailOptions = {
        from: `"Streaming Platform" <${
          process.env.EMAIL_FROM || "noreply@streamingplatform.com"
        }>`,
        to: email,
        subject: "Verify Your Email Address",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f4f4f4; padding: 20px; margin-top: 0; }
              .button { display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Streaming Platform!</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
                <center>
                  <a href="${verificationUrl}" class="button">Verify Email</a>
                </center>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 Streaming Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info("Verification email sent:", info.messageId);

      if (process.env.NODE_ENV !== "production") {
        logger.info("Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      logger.error("Send verification email error:", error);
      throw error;
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email, token) => {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost"
      }/reset-password?token=${token}`;

      const mailOptions = {
        from: `"Streaming Platform" <${
          process.env.EMAIL_FROM || "noreply@streamingplatform.com"
        }>`,
        to: email,
        subject: "Reset Your Password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f4f4f4; padding: 20px; margin-top: 0; }
              .button { display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <center>
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </center>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
                <div class="warning">
                  <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
                </div>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                <p>For security reasons, we recommend changing your password regularly and using a unique password for each online account.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 Streaming Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info("Password reset email sent:", info.messageId);

      if (process.env.NODE_ENV !== "production") {
        logger.info("Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      logger.error("Send password reset email error:", error);
      throw error;
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (email, username) => {
    try {
      const mailOptions = {
        from: `"Streaming Platform" <${
          process.env.EMAIL_FROM || "noreply@streamingplatform.com"
        }>`,
        to: email,
        subject: "Welcome to Streaming Platform!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f4f4f4; padding: 20px; margin-top: 0; }
              .feature { background-color: white; padding: 15px; margin: 10px 0; border-radius: 4px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Streaming Platform!</h1>
              </div>
              <div class="content">
                <h2>Hi ${username}!</h2>
                <p>Your account has been successfully created and verified. You now have access to thousands of movies and TV shows!</p>
                
                <h3>Here's what you can do:</h3>
                <div class="feature">
                  <strong>🎬 Browse Content:</strong> Explore our vast library of movies and series
                </div>
                <div class="feature">
                  <strong>❤️ Create Favorites:</strong> Save your favorite content for easy access
                </div>
                <div class="feature">
                  <strong>📊 Track Progress:</strong> Keep track of what you've watched
                </div>
                <div class="feature">
                  <strong>🔍 Smart Search:</strong> Find exactly what you're looking for
                </div>
                
                <center>
                  <a href="${
                    process.env.FRONTEND_URL || "http://localhost"
                  }" class="button">Start Watching</a>
                </center>
                
                <p>If you have any questions, feel free to contact our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 Streaming Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info("Welcome email sent:", info.messageId);

      return true;
    } catch (error) {
      logger.error("Send welcome email error:", error);
      // Don't throw - welcome email is not critical
      return false;
    }
  },

  // Send account deactivation email
  sendAccountDeactivationEmail: async (email, username) => {
    try {
      const mailOptions = {
        from: `"Streaming Platform" <${
          process.env.EMAIL_FROM || "noreply@streamingplatform.com"
        }>`,
        to: email,
        subject: "Account Deactivated",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Account Deactivated</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f4f4f4; padding: 20px; margin-top: 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Account Deactivated</h1>
              </div>
              <div class="content">
                <h2>Hi ${username},</h2>
                <p>Your account has been deactivated as requested. We're sorry to see you go!</p>
                <p>Your account data will be retained for 30 days in case you change your mind. After that, it will be permanently deleted.</p>
                <p>If you'd like to reactivate your account within this period, simply log in with your credentials.</p>
                <p>Thank you for being part of our community.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 Streaming Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info("Account deactivation email sent:", info.messageId);

      return true;
    } catch (error) {
      logger.error("Send account deactivation email error:", error);
      return false;
    }
  },
};

module.exports = emailService;
