import { Resend } from "resend";

import { logger } from "@/lib/logger";
import type { EmailPayload, EmailProvider, EmailResult } from "./types";

export class ResendEmailProvider implements EmailProvider {
  private client: Resend;
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom = "onboarding@resend.dev") {
    const key = apiKey ?? process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY no está configurada en las variables de entorno.");
    }
    this.client = new Resend(key);
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    try {
      const from = payload.from ?? this.defaultFrom;
      const response = await this.client.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      if (response.error) {
        logger.error("ResendEmailProvider", "dispatch error", response.error, {
          to: payload.to,
        });
        return {
          id: "",
          success: false,
          error: response.error.message,
        };
      }

      const emailId = response.data?.id ?? `resend_${Date.now()}`;
      logger.info("ResendEmailProvider", "email accepted", {
        id: emailId,
        to: payload.to,
      });

      return {
        id: emailId,
        success: true,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("ResendEmailProvider", "unexpected exception", err, { message });
      return {
        id: "",
        success: false,
        error: message,
      };
    }
  }
}
