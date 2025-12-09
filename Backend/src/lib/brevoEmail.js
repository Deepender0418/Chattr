// lib/brevoEmail.js
import brevo from '@getbrevo/brevo';

// Initialize the API client with your key
const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key authentication
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Log for debugging (remove in production)
console.log('[Brevo Config] API Key configured:', process.env.BREVO_API_KEY ? 'Yes (Length: ' + process.env.BREVO_API_KEY.length + ')' : 'NO - KEY MISSING');

/**
 * Sends a transactional email via Brevo API.
 * @param {Object} options - Email options.
 * @param {string} options.toEmail - Recipient email address.
 * @param {string} options.toName - Recipient name.
 * @param {string} options.subject - Email subject.
 * @param {string} options.htmlContent - The HTML body of the email.
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
    // Create the email object
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
        name: process.env.SENDER_NAME || 'Your App',
        email: process.env.SENDER_EMAIL, // MUST be verified in Brevo
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    // Optional: add a plain text version for better deliverability
    sendSmtpEmail.textContent = htmlContent.replace(/<[^>]*>/g, '');

    try {
        console.log(`[Brevo] Attempting to send email to: ${toEmail}`);
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('[Brevo] Email sent successfully. Message ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('[Brevo API Error] Full Error:', error);
        // Provide a more user-friendly error message
        if (error.response) {
            console.error('[Brevo API Error] Response Body:', error.response.body);
            console.error('[Brevo API Error] Response Text:', error.response.text);
        }
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
