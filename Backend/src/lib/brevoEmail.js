import brevo from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    throw new Error(
        "Email configuration error: BREVO_API_KEY and SENDER_EMAIL are required for Brevo."
    );
}

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

const withTimeout = (promise, ms = 10000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Email request timeout after ${ms}ms`)), ms)
        ),
    ]);

const htmlToText = (html) => {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<p>/gi, '\n\n')
        .replace(/<\/p>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
};

/**
 * Sends transactional email via Brevo API.
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - HTML content
 * @param {string} [params.textContent] - Optional plain text content (auto-generated if not provided)
 * @returns {Promise<Object>} Brevo API response
 */
export const sendEmail = async ({ 
    toEmail, 
    toName, 
    subject, 
    htmlContent,
    textContent 
    }) => {
    const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
    const senderName = process.env.SENDER_NAME || "Chattr";
    const textBody = textContent || htmlToText(htmlContent);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textBody;

    try {
        console.log(`[Brevo] Sending email to ${toEmail} (${toName})...`);
        const result = await withTimeout(apiInstance.sendTransacEmail(sendSmtpEmail));
        console.log(`[Brevo] Email sent successfully. MessageID: ${result.messageId}`);
        return { success: true, messageId: result.messageId, message: "Email sent via Brevo" };
    } catch (error) {
        console.error("❌ [Brevo Email Error]", error.message);
        if (error.response?.body) {
            console.error("➡️ Brevo Response Body:", JSON.stringify(error.response.body, null, 2));
        }
        throw new Error(
            `Failed to send email to ${toEmail} via Brevo: ${error.message}${
            error.response?.body?.message ? ` - ${error.response.body.message}` : ""
        }`
        );
    }
};

/**
 * Utility function to send common email types
 */
export const sendVerificationEmail = async ({ toEmail, toName, verificationLink }) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Hello ${toName},</p>
            <p>Please click the link below to verify your email address:</p>
            <p>
                <a href="${verificationLink}" 
                style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
            </p>
            <p>Or copy this link: ${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
        </div>
    `;

    return sendEmail({
        toEmail,
        toName,
        subject: "Verify Your Email",
        htmlContent,
    });
};
