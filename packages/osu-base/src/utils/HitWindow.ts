abstract class HitWindow {
    /**
     * The overall difficulty of this hit window.
     */
    readonly overallDifficulty: number;

    /**
     * @param overallDifficulty The overall difficulty of this hit window.
     */
    constructor(overallDifficulty: number) {
        this.overallDifficulty = overallDifficulty;
    }

    /**
     * Gets the hit window for 300 (great) hit result.
     *
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The hit window in milliseconds.
     */
    abstract hitWindowFor300(isPrecise?: boolean): number;

    /**
     * Gets the hit window for 100 (good) hit result.
     *
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The hit window in milliseconds.
     */
    abstract hitWindowFor100(isPrecise?: boolean): number;

    /**
     * Gets the hit window for 50 (meh) hit result.
     *
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The hit window in milliseconds.
     */
    abstract hitWindowFor50(isPrecise?: boolean): number;
}

/**
 * Represents the hit window of osu!droid.
 */
export class DroidHitWindow extends HitWindow {
    /**
     * Calculates the overall difficulty value of a great hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The overall difficulty value.
     */
    static hitWindow300ToOD(value: number, isPrecise?: boolean): number {
        if (isPrecise) {
            return 5 - (value - 55) / 6;
        } else {
            return 5 - (value - 75) / 5;
        }
    }

    /**
     * Calculates the overall difficulty value of a good hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The overall difficulty value.
     */
    static hitWindow100ToOD(value: number, isPrecise?: boolean): number {
        if (isPrecise) {
            return 5 - (value - 120) / 8;
        } else {
            return 5 - (value - 150) / 10;
        }
    }

    /**
     * Calculates the overall difficulty value of a meh hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @param isPrecise Whether to calculate for Precise mod.
     * @returns The overall difficulty value.
     */
    static hitWindow50ToOD(value: number, isPrecise?: boolean): number {
        if (isPrecise) {
            return 5 - (value - 180) / 10;
        } else {
            return 5 - (value - 250) / 10;
        }
    }

    override hitWindowFor300(isPrecise?: boolean): number {
        if (isPrecise) {
            return 55 + 6 * (5 - this.overallDifficulty);
        } else {
            return 75 + 5 * (5 - this.overallDifficulty);
        }
    }

    override hitWindowFor100(isPrecise?: boolean): number {
        if (isPrecise) {
            return 120 + 8 * (5 - this.overallDifficulty);
        } else {
            return 150 + 10 * (5 - this.overallDifficulty);
        }
    }

    override hitWindowFor50(isPrecise?: boolean): number {
        if (isPrecise) {
            return 180 + 10 * (5 - this.overallDifficulty);
        } else {
            return 250 + 10 * (5 - this.overallDifficulty);
        }
    }
}

/**
 * Represents the hit window of osu!standard.
 */
export class OsuHitWindow extends HitWindow {
    /**
     * Calculates the overall difficulty value of a great hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static hitWindow300ToOD(value: number): number {
        return (80 - value) / 6;
    }

    /**
     * Calculates the overall difficulty value of a good hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static hitWindow100ToOD(value: number): number {
        return (140 - value) / 8;
    }

    /**
     * Calculates the overall difficulty value of a meh hit window.
     *
     * @param value The value of the hit window, in milliseconds.
     * @returns The overall difficulty value.
     */
    static hitWindow50ToOD(value: number): number {
        return (200 - value) / 10;
    }

    override hitWindowFor300(): number {
        return 80 - 6 * this.overallDifficulty;
    }

    override hitWindowFor100(): number {
        return 140 - 8 * this.overallDifficulty;
    }

    override hitWindowFor50(): number {
        return 200 - 10 * this.overallDifficulty;
    }
}
