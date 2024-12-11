import { HitWindow } from "./HitWindow";

/**
 * Represents the hit window of osu!droid _without_ the Precise mod.
 */
export class DroidHitWindow extends HitWindow {
    /**
     * Calculates the overall difficulty value of a great (300) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static greatWindowToOD(value: number): number {
        return 5 - (value - 75) / 5;
    }

    /**
     * Calculates the overall difficulty value of a good (100) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static okWindowToOD(value: number): number {
        return 5 - (value - 150) / 10;
    }

    /**
     * Calculates the overall difficulty value of a meh (50) hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static mehWindowToOD(value: number): number {
        return 5 - (value - 250) / 10;
    }

    override get greatWindow(): number {
        return 75 + 5 * (5 - this.overallDifficulty);
    }

    override get okWindow(): number {
        return 150 + 10 * (5 - this.overallDifficulty);
    }

    override get mehWindow(): number {
        return 250 + 10 * (5 - this.overallDifficulty);
    }
}
