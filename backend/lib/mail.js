// import { MailtrapClient } from "mailtrap";
// import dotenv from "dotenv";

// dotenv.config();

// const TOKEN = process.env.MAILTRAP_TOKEN;

// const client = new MailtrapClient({ token: TOKEN }); // Renamed from 'mailtrap'

// export const sender = {
//     email: process.env.EMAIL_FROM,
//     name: process.env.EMAIL_FROM_NAME
// };

// // Export the client properly
// export { client as MailtrapClient };

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sender = {
    email: process.env.EMAIL_USER,
    name: process.env.EMAIL_FROM_NAME,
};

export const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent successfully:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
