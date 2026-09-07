import { logger } from "@/lib/logger";
import type { EmailPayload, EmailProvider, EmailResult } from "./types";

export class MockEmailProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    const mockId = `mock_email_${Date.now()}`;
    logger.info("MockEmailProvider", "simulated email dispatch", {
      id: mockId,
      to: payload.to,
      subject: payload.subject,
    });
    return {
      id: mockId,
      success: true,
    };
  }
}
