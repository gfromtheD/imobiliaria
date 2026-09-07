export interface EmailPayload {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  id: string;
  success: boolean;
  error?: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<EmailResult>;
}
