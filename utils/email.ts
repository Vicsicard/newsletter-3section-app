import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

// Initialize API instance with API key
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@newsletter-generator.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Newsletter Generator';

if (!BREVO_API_KEY) {
  throw new Error('Missing BREVO_API_KEY environment variable');
}

if (!process.env.BREVO_SENDER_EMAIL) {
  console.warn('Warning: BREVO_SENDER_EMAIL not set, using default value');
}

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  code?: number;
  error?: {
    code: number;
    message: string;
  } | string;
  email?: string;
}

export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<EmailResponse> {
  console.log('Preparing to send email to:', to);
  
  // Validate inputs
  if (!to || !subject || !htmlContent) {
    console.error('Missing required email parameters:', { to, subject, hasHtmlContent: !!htmlContent });
    return {
      success: false,
      error: {
        code: 400,
        message: 'Missing required email parameters'
      },
      email: to
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    console.error('Invalid email address:', to);
    return {
      success: false,
      error: {
        code: 400,
        message: 'Invalid email address'
      },
      email: to
    };
  }

  const sendSmtpEmail = new SendSmtpEmail();

  // Set up email parameters
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: BREVO_SENDER_NAME,
    email: BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ 
    email: to,
    name: to.split('@')[0] // Use part before @ as name
  }];
  
  // Set reply-to as same as sender
  sendSmtpEmail.replyTo = {
    email: BREVO_SENDER_EMAIL,
    name: BREVO_SENDER_NAME
  };

  // Add custom headers for tracking
  sendSmtpEmail.headers = {
    'X-Mailer': 'Newsletter Generator App',
    'X-Environment': process.env.NODE_ENV || 'development'
  };
  
  try {
    console.log('Sending email with parameters:', {
      to,
      subject,
      sender: sendSmtpEmail.sender,
      contentLength: htmlContent.length
    });

    // Send email and get response
    const { response, body } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Check if response is successful (2xx status code)
    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Email sent successfully:', {
        to,
        messageId: body.messageId,
        statusCode: response.statusCode
      });
      return { 
        success: true,
        messageId: body.messageId,
        code: response.statusCode,
        email: to
      };
    }

    // Handle unexpected success status codes
    console.error('Unexpected response from email service:', {
      statusCode: response.statusCode,
      body
    });
    return {
      success: false,
      code: response.statusCode,
      error: {
        code: response.statusCode || 500,
        message: 'Unexpected response from email service'
      },
      email: to
    };

  } catch (error: any) {
    console.error('Error sending email:', {
      to,
      error: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    // Extract error details from the response
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';

    return {
      success: false,
      code: statusCode,
      error: {
        code: statusCode,
        message: errorMessage
      },
      email: to
    };
  }
}
