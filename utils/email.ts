import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

// Initialize API instance with API key
const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  code?: number;
  error?: {
    code: number;
    message: string;
  };
}

export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<EmailResponse> {
  const sendSmtpEmail = new SendSmtpEmail();

  // Set up email parameters
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Newsletter Generator',
    email: process.env.BREVO_SENDER_EMAIL || '',
  };
  sendSmtpEmail.to = [{ 
    email: to,
    name: to.split('@')[0] // Use part before @ as name
  }];
  
  // Set reply-to as same as sender
  sendSmtpEmail.replyTo = {
    email: process.env.BREVO_SENDER_EMAIL || '',
    name: process.env.BREVO_SENDER_NAME || 'Newsletter Generator'
  };

  // Add custom headers for tracking
  sendSmtpEmail.headers = {
    'X-Mailer': 'Newsletter Generator App',
    'X-Environment': process.env.NODE_ENV || 'development'
  };
  
  try {
    // Send email and get response
    const { response, body } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Check if response is successful (2xx status code)
    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Email sent successfully:', JSON.stringify(body));
      return { 
        success: true,
        messageId: body.messageId,
        code: response.statusCode
      };
    }

    // Handle unexpected success status codes
    return {
      success: false,
      code: response.statusCode,
      error: {
        code: response.statusCode || 500,
        message: 'Unexpected response from email service'
      }
    };

  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Extract error details from the response
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';

    return {
      success: false,
      code: statusCode,
      error: {
        code: statusCode,
        message: errorMessage
      }
    };
  }
}
