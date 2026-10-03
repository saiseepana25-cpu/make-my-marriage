import "server-only";
import { unavailable } from "@/lib/api/errors";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}
export type EmailDelivery =
  | { status: "sent"; providerMessageId?: string }
  | { status: "not-sent"; reason: "development-adapter" };

export interface EmailService {
  sendEmail(message: EmailMessage): Promise<EmailDelivery>;
}

// No recipients, message bodies, passwords or invitation links are logged.
export class DevelopmentEmailService implements EmailService {
  async sendEmail(message: EmailMessage): Promise<EmailDelivery> {
    void message;
    if (process.env.NODE_ENV === "production") throw unavailable("Email delivery");
    return { status: "not-sent", reason: "development-adapter" };
  }
}

export const emailService: EmailService = {
  async sendEmail(message) {
    if (process.env.NODE_ENV !== "development") throw unavailable("Email delivery");
    return new DevelopmentEmailService().sendEmail(message);
  },
};
