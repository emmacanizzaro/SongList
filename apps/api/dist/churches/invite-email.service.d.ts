import { ConfigService } from "@nestjs/config";
import { MemberRole } from "@prisma/client";
interface SendInviteEmailParams {
    email: string;
    churchName: string;
    role: MemberRole;
    token: string;
    expiresAt: Date;
}
export declare class InviteEmailService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    sendInviteEmail({ email, churchName, role, token, expiresAt, }: SendInviteEmailParams): Promise<{
        emailSent: boolean;
        inviteUrl: string;
    }>;
    private getRoleLabel;
}
export {};
