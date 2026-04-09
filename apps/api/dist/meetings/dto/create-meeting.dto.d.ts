export declare class CreateMeetingSongDto {
    songId: string;
    order: number;
    keyOverride?: string;
    notes?: string;
}
export declare class CreateMeetingDto {
    title: string;
    date: string;
    notes?: string;
    isPublic?: boolean;
    songs?: CreateMeetingSongDto[];
}
