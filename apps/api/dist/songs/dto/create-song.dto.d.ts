import { VersionType } from "@prisma/client";
export declare class CreateSongVersionDto {
    type: VersionType;
    key: string;
    lyricsChords: string;
    notes?: string;
}
export declare class CreateSongDto {
    title: string;
    artist?: string;
    originalKey: string;
    bpm?: number;
    tags?: string[];
    version?: CreateSongVersionDto;
}
