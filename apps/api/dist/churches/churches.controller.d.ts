import { MemberRole } from "@prisma/client";
import { ChurchesService } from "./churches.service";
import { CreateChurchDto } from "./dto/create-church.dto";
export declare class ChurchesController {
    private readonly churchesService;
    constructor(churchesService: ChurchesService);
    getMyChurch(churchId: string): Promise<{
        subscription: {
            id: string;
            churchId: string;
            createdAt: Date;
            updatedAt: Date;
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
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        logoUrl: string | null;
        timezone: string;
    }>;
    update(churchId: string, dto: CreateChurchDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        logoUrl: string | null;
        timezone: string;
    }>;
    getStats(churchId: string): Promise<{
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
                songId: string;
                order: number;
                keyOverride: string | null;
                meetingId: string;
            })[];
        } & {
            title: string;
            id: string;
            churchId: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            notes: string | null;
            isPublic: boolean;
            shareToken: string | null;
            createdById: string | null;
        })[];
    }>;
    getMembers(churchId: string): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        churchId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        userId: string;
        joinedAt: Date;
    })[]>;
    inviteMember(churchId: string, role: MemberRole, email: string, memberRole: MemberRole): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        churchId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        userId: string;
        joinedAt: Date;
    }>;
    createInviteLink(churchId: string, invitedByUserId: string, role: MemberRole, email: string, memberRole: MemberRole): Promise<{
        token: string;
        email: string;
        role: import(".prisma/client").$Enums.MemberRole;
        churchName: string;
        expiresAt: Date;
        inviteUrl: string;
        emailSent: boolean;
    }>;
    updateRole(churchId: string, memberId: string, role: MemberRole): Promise<{
        id: string;
        churchId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        userId: string;
        joinedAt: Date;
    }>;
    removeMember(churchId: string, userId: string, memberId: string): Promise<{
        id: string;
        churchId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        userId: string;
        joinedAt: Date;
    }>;
}
export declare class PublicChurchInvitesController {
    private readonly churchesService;
    constructor(churchesService: ChurchesService);
    getInviteByToken(token: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.MemberRole;
        churchName: string;
        churchSlug: string;
        expiresAt: Date;
        token: string;
    }>;
}
