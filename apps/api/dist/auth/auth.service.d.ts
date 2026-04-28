import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { WelcomeEmailService } from "./welcome-email.service";
export declare class AuthService {
    private prisma;
    private jwt;
    private welcomeEmail;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, welcomeEmail: WelcomeEmailService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    switchChurch(userId: string, churchId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(rawRefreshToken: string): Promise<void>;
    private issueTokens;
    private hashToken;
    private generateSlug;
}
