import { ScoreRank } from "@rian8337/osu-base";

export interface APIScore {
    readonly id: number;
    readonly uid: number;
    readonly username: string;
    readonly filename: string;
    readonly score: number;
    readonly combo: number;
    readonly mark: ScoreRank;
    readonly mode: string;
    readonly accuracy: number;
    readonly perfect: number;
    readonly good: number;
    readonly bad: number;
    readonly miss: number;
    readonly date: number;
    readonly hash: string;
    readonly pp: number | null;
}
