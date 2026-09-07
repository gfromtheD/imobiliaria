import { MockEmailProvider } from "./mock";
import { ResendEmailProvider } from "./resend";
import type { EmailProvider } from "./types";

export * from "./types";
export * from "./mock";
export * from "./resend";

let emailProviderInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (emailProviderInstance) {
    return emailProviderInstance;
  }

  if (process.env.RESEND_API_KEY) {
    emailProviderInstance = new ResendEmailProvider();
  } else {
    emailProviderInstance = new MockEmailProvider();
  }

  return emailProviderInstance;
}
