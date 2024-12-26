import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApi.ApiKeysEnum.apiKey, process.env.BREVO_API_KEY || '');

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const sendSmtpEmail = new SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Newsletter Generator',
    email: process.env.BREVO_SENDER_EMAIL || '',
  };
  sendSmtpEmail.to = [{ email: to }];
  
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
