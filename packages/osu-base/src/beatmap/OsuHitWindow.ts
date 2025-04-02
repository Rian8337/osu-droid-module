import { HitWindow } from "./HitWindow";

/**
 * Represents the hit window of osu!standard.
 */
export class OsuHitWindow extends HitWindow {
    /**
     * Calculates the overall difficulty value of a great (300) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static greatWindowToOD(value: number): number {
        return (80 - value) / 6;
    }

    /**
     * Calculates the overall difficulty value of a good (100) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static okWindowToOD(value: number): number {
        return (140 - value) / 8;
    }

    /**
     * Calculates the overall difficulty value of a meh hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static mehWindowToOD(value: number): number {
        return (200 - value) / 10;
    }

    override get greatWindow(): number {
        return 80 - 6 * this.overallDifficulty;
    }

    override get okWindow(): number {
        return 140 - 8 * this.overallDifficulty;
    }

    override get mehWindow(): number {
        return 200 - 10 * this.overallDifficulty;
    }
}
