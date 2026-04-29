import { ConfigService } from "@nestjs/config";
interface SendWelcomeEmailParams {
  email: string;
  name: string;
}
export declare class WelcomeEmailService {
  private readonly config;
  private readonly logger;
  constructor(config: ConfigService);
  sendWelcomeEmail({ email, name }: SendWelcomeEmailParams): Promise<{
    emailSent: boolean;
  }>;
}
export {};
