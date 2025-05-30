import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string): Promise<void> {
  try {
    await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS notification');
  }
} 