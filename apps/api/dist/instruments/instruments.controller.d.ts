import { InstrumentsService } from './instruments.service';
export declare class InstrumentsController {
    private readonly instrumentsService;
    constructor(instrumentsService: InstrumentsService);
    findAll(churchId: string): Promise<({
        _count: {
            assignments: number;
        };
    } & {
        name: string;
        id: string;
        churchId: string;
        icon: string | null;
        sortOrder: number;
    })[]>;
    create(churchId: string, name: string, icon?: string): Promise<{
        name: string;
        id: string;
        churchId: string;
        icon: string | null;
        sortOrder: number;
    }>;
    update(churchId: string, id: string, name: string, icon?: string): Promise<{
        name: string;
        id: string;
        churchId: string;
        icon: string | null;
        sortOrder: number;
    }>;
    remove(churchId: string, id: string): Promise<{
        name: string;
        id: string;
        churchId: string;
        icon: string | null;
        sortOrder: number;
    }>;
    reorder(churchId: string, orderedIds: string[]): Promise<({
        _count: {
            assignments: number;
        };
    } & {
        name: string;
        id: string;
        churchId: string;
        icon: string | null;
        sortOrder: number;
    })[]>;
}
