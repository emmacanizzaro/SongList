import { PrismaService } from '../../prisma/prisma.service';
export declare class TenantBaseService {
    protected readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
    protected assertBelongsToTenant<T extends {
        churchId: string;
    }>(resource: T | null, churchId: string, resourceName?: string): Promise<T>;
}
