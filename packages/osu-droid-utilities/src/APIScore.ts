import { ScoreRank, SerializedMod } from "@rian8337/osu-base";

export interface APIScore {
    readonly id: number;
    readonly uid: number;
    readonly username: string;
    readonly filename: string;
    readonly score: number;
    readonly combo: number;
    readonly mark: ScoreRank;
    readonly mods: SerializedMod[];
    readonly accuracy: number;
    readonly perfect: number;
    readonly good: number;
    readonly bad: number;
    readonly miss: number;
    readonly slider_tick_hit: number | null;
    readonly slider_end_hit: number | null;
    readonly date: number;
    readonly hash: string;
    readonly pp: number | null;
}
