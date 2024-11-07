export interface APIScore {
    readonly id: number;
    readonly uid: number;
    readonly username: string;
    readonly filename: string;
    readonly score: number;
    readonly scoreid: number;
    readonly combo: number;
    readonly mark: string;
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
