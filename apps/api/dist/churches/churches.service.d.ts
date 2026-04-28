import { MemberRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "../subscriptions/entitlements.service";
import { CreateChurchDto } from "./dto/create-church.dto";
import { InviteEmailService } from "./invite-email.service";
export declare class ChurchesService {
    private prisma;
    private entitlements;
    private inviteEmail;
    private readonly logger;
    constructor(prisma: PrismaService, entitlements: EntitlementsService, inviteEmail: InviteEmailService);
    findById(churchId: string): Promise<{
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            churchId: string;
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            cancelAtPeriodEnd: boolean;
            mpSubscriptionId: string | null;
            mpCustomerEmail: string | null;
        } | null;
        _count: {
            memberships: number;
            songs: number;
            meetings: number;
        };
    } & {
        id: string;
        slug: string;
        name: string;
        logoUrl: string | null;
        description: string | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(churchId: string, dto: Partial<CreateChurchDto>): Promise<{
        id: string;
        slug: string;
        name: string;
        logoUrl: string | null;
        description: string | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMembers(churchId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        churchId: string;
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    })[]>;
    inviteMember(churchId: string, email: string, role: MemberRole, requestingRole: MemberRole): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        churchId: string;
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    createInviteLink(churchId: string, invitedByUserId: string, email: string, role: MemberRole, requestingRole: MemberRole): Promise<{
        token: string;
        email: string;
        role: import(".prisma/client").$Enums.MemberRole;
        churchName: string;
        expiresAt: Date;
        inviteUrl: string;
        emailSent: boolean;
    }>;
    getInviteByToken(token: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.MemberRole;
        churchName: string;
        churchSlug: string;
        expiresAt: Date;
        token: string;
    }>;
    updateMemberRole(churchId: string, memberId: string, role: MemberRole): Promise<{
        id: string;
        churchId: string;
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    removeMember(churchId: string, memberId: string, requestingUserId: string): Promise<{
        id: string;
        churchId: string;
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    getDashboardStats(churchId: string): Promise<{
        membersCount: number;
        songsCount: number;
        meetingsCount: number;
        upcomingMeetings: ({
            _count: {
                assignments: number;
            };
            meetingSongs: ({
                song: {
                    title: string;
                };
            } & {
                id: string;
                notes: string | null;
                meetingId: string;
                songId: string;
                order: number;
                keyOverride: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            churchId: string;
            title: string;
            date: Date;
            notes: string | null;
            isPublic: boolean;
            shareToken: string | null;
            createdById: string | null;
        })[];
    }>;
}
