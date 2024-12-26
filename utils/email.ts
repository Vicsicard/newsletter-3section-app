import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiConfiguration = new SibApiV3Sdk.Configuration();
apiConfiguration.apiKey = process.env.BREVO_API_KEY || '';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi(apiConfiguration);

export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
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
