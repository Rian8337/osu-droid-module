import { APIScore } from "./APIScore";

export interface APIPlayer {
    readonly id: number;
    readonly username: string;
    readonly score: number;
    readonly playcount: number;
    readonly accuracy: number;
    readonly region: string;
    readonly rank: number;
    readonly pp: number;
    readonly recent: APIScore[];
}
