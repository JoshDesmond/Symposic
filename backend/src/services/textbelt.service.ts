interface TextbeltResponse {
  success: boolean;
  quotaRemaining?: number;
  textId?: number;
  error?: string;
}

export class TextbeltService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://textbelt.com/text';

  constructor() {
    this.apiKey = process.env.TEXTBELT_API_KEY || 'textbelt';
  }

  async sendSMS(phone: string, message: string, isTest: boolean = false): Promise<TextbeltResponse> {
    try {
      const key = isTest ? `${this.apiKey}_test` : this.apiKey;
      
      const formData = new URLSearchParams();
      formData.append('phone', phone);
      formData.append('message', message);
      formData.append('key', key);
      formData.append('sender', 'Symposic');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as TextbeltResponse;
    } catch (error) {
      console.error('Error sending SMS via Textbelt:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendOTPCode(phone: string, code: number, isTest: boolean = false): Promise<TextbeltResponse> {
    const message = `Your Symposic verification code is: ${code}. This code expires in 10 minutes.`;
    return this.sendSMS(phone, message, isTest);
  }
}
