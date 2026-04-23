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
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            cancelAtPeriodEnd: boolean;
            mpSubscriptionId: string | null;
            mpCustomerEmail: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        _count: {
            memberships: number;
            songs: number;
            meetings: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        timezone: string;
    }>;
    update(churchId: string, dto: CreateChurchDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        timezone: string;
    }>;
    getStats(churchId: string): Promise<{
        membersCount: number;
        songsCount: number;
        meetingsCount: number;
        upcomingMeetings: ({
            meetingSongs: ({
                song: {
                    title: string;
                };
            } & {
                id: string;
                notes: string | null;
                songId: string;
                order: number;
                meetingId: string;
                keyOverride: string | null;
            })[];
            _count: {
                assignments: number;
            };
        } & {
            id: string;
            churchId: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            createdById: string | null;
            notes: string | null;
            date: Date;
            isPublic: boolean;
            shareToken: string | null;
        })[];
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
    inviteMember(churchId: string, role: MemberRole, email: string, memberRole: MemberRole): Promise<{
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
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
        joinedAt: Date;
    }>;
    removeMember(churchId: string, userId: string, memberId: string): Promise<{
        id: string;
        churchId: string;
        userId: string;
        role: import(".prisma/client").$Enums.MemberRole;
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
