import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP config error:', error);
  } else {
    console.log('SMTP config is valid');
  }
});

export const sender = {
  name: process.env.EMAIL_FROM_NAME,
  email: process.env.EMAIL_USER
};

export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};