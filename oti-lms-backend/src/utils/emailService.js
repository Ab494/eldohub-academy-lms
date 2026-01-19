import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

// Email templates
export const enrollmentEmailTemplate = (studentName, courseName) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Welcome to ${courseName}!</h2>
    <p>Hi ${studentName},</p>
    <p>You have successfully enrolled in <strong>${courseName}</strong>. You can now access all course materials and lessons.</p>
    <p>Best regards,<br/>Oval Training Institute "OTI" Team</p>
  </div>
`;

export const assignmentGradeEmailTemplate = (studentName, courseName, assignmentName, grade, feedback) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Assignment Graded: ${assignmentName}</h2>
    <p>Hi ${studentName},</p>
    <p>Your assignment for <strong>${courseName}</strong> has been graded.</p>
    <p><strong>Grade:</strong> ${grade}%</p>
    <p><strong>Feedback:</strong> ${feedback}</p>
    <p>Best regards,<br/>Oval Training Institute "OTI" Team</p>
  </div>
`;

export const forgotPasswordEmailTemplate = (userName, resetUrl) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <h2>Reset Your Password</h2>
    <p>Hi ${userName},</p>
    <p>You requested to reset your password for your OTI account. Click the button below to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
    <p>Best regards,<br/>Oval Training Institute "OTI" Team</p>
  </div>
`;

export const courseCompletionEmailTemplate = (studentName, courseName, certificateId) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Congratulations! 🎉</h2>
    <p>Hi ${studentName},</p>
    <p>You have successfully completed <strong>${courseName}</strong>!</p>
    <p>Your certificate has been generated. Certificate ID: <strong>${certificateId}</strong></p>
    <p>Download your certificate from the dashboard.</p>
    <p>Best regards,<br/>Oval Training Institute "OTI" Team</p>
  </div>
`;
