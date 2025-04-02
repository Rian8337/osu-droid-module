import { HitWindow } from "./HitWindow";

/**
 * Represents the hit window of osu!droid _with_ the Precise mod.
 */
export class PreciseDroidHitWindow extends HitWindow {
    /**
     * Calculates the overall difficulty value of a great (300) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static greatWindowToOD(value: number): number {
        return 5 - (value - 55) / 6;
    }

    /**
     * Calculates the overall difficulty value of a good (100) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static okWindowToOD(value: number): number {
        return 5 - (value - 120) / 8;
    }

    /**
     * Calculates the overall difficulty value of a meh (50) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static mehWindowToOD(value: number): number {
        return 5 - (value - 180) / 10;
    }

    override get greatWindow(): number {
        return 55 + 6 * (5 - this.overallDifficulty);
    }

    override get okWindow(): number {
        return 120 + 8 * (5 - this.overallDifficulty);
    }

    override get mehWindow(): number {
        return 180 + 10 * (5 - this.overallDifficulty);
    }
}
