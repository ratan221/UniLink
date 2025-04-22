// import { MailtrapClient,sender } from "../lib/mailtrap.js";
// import { createWelcomeEmailTemplate } from "./emailTemplates.js";

// export const sendWelcomeEmail = async (email, name, profileUrl) => {
//     const recipient = [({email})]

//     try {
//         const response = await MailtrapClient.send({
//             from: sender,
//             to: recipient,
//             subject: "Welcome to UniLink",
//             html: createWelcomeEmailTemplate(name, profileUrl),
//             category: "Welcome"
//         });

//         console.log("Welcome Email sent successfully",response);
//         } catch (error) {
//         throw error;
//     }

// };

import { sendMail, sender } from "../lib/mail.js";
import {
    createCommentNotificationEmailTemplate,
    createConnectionAcceptedEmailTemplate,
    createWelcomeEmailTemplate,
} from "./emailTemplates.js";

/**
 * Send Welcome Email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} profileUrl - Profile URL
 */
export const sendWelcomeEmail = async (email, name, profileUrl) => {
    try {
        if (!email) throw new Error("Recipient email is missing.");

        console.log("📩 Sending Welcome Email to:", email);

        const htmlContent = createWelcomeEmailTemplate(name, profileUrl);
        const response = await sendMail(email, "Welcome to UniLink", htmlContent);
        
        console.log("✅ Welcome Email sent successfully:", response);
    } catch (error) {
        console.error("❌ Error sending welcome email:", error);
        throw error;
    }
};

/**
 * Send Comment Notification Email
 * @param {string} recipientEmail - Recipient's email
 * @param {string} recipientName - Recipient's name
 * @param {string} commenterName - Name of the commenter
 * @param {string} postUrl - URL of the post
 * @param {string} commentContent - Content of the comment
 */
export const sendCommentNotificationEmail = async (
    recipientEmail,
    recipientName,
    commenterName,
    postUrl,
    commentContent
) => {
    try {
        if (!recipientEmail) throw new Error("Recipient email is missing.");

        console.log("📩 Sending Comment Notification Email to:", recipientEmail);

        const htmlContent = createCommentNotificationEmailTemplate(
            recipientName,
            commenterName,
            postUrl,
            commentContent
        );

        const response = await sendMail(
            recipientEmail,
            "New Comment on Your Post",
            htmlContent
        );

        console.log("✅ Comment Notification Email sent successfully:", response);
    } catch (error) {
        console.error("❌ Error sending comment notification email:", error);
    }
};

/**
 * Send Connection Accepted Email
 * @param {string} senderEmail - Sender's email (who receives the email)
 * @param {string} senderName - Sender's name
 * @param {string} recipientName - Recipient's name (who accepted the connection)
 * @param {string} profileUrl - Profile URL
 */
export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName, profileUrl) => {
    try {
        if (!senderEmail) throw new Error("Sender email is missing.");

        console.log("📩 Sending Connection Accepted Email to:", senderEmail);

        const htmlContent = createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl);
        const response = await sendMail(
            senderEmail,
            `${recipientName} accepted your connection request`,
            htmlContent
        );

        console.log("✅ Connection Accepted Email sent successfully:", response);
    } catch (error) {
        console.error("❌ Error sending connection accepted email:", error);
    }
};
