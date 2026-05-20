import { HitResult } from "../constants/HitResult";

/**
 * Represents a hit window.
 */
export abstract class HitWindow {
    /**
     * A fixed miss hit window regardless of difficulty settings.
     */
    static readonly missWindow = 400;

    /**
     * The overall difficulty of this `HitWindow`.
     */
    overallDifficulty: number;

    /**
     * @param overallDifficulty The overall difficulty of this `HitWindow`. Defaults to 5.
     */
    constructor(overallDifficulty = 5) {
        this.overallDifficulty = overallDifficulty;
    }

    /**
     * The great (300) window of this `HitWindow`.
     */
    abstract get greatWindow(): number;

    /**
     * The ok (100) window of this `HitWindow`.
     */
    abstract get okWindow(): number;

    /**
     * The meh (50) window of this `HitWindow`.
     */
    abstract get mehWindow(): number;

    /**
     * Retrieves the hit window for a {@link HitResult}. This is the number of +/- milliseconds
     * allowed for the requested result (so the actual hittable range is double this).
     *
     * @param result The {@link HitResult} to retrieve the hit window for.
     * @returns The hit window for the requested {@link HitResult}.
     */
    hitWindowFor(result: HitResult): number {
        switch (result) {
            case HitResult.great:
                return this.greatWindow;

            case HitResult.good:
                return this.okWindow;

            case HitResult.meh:
                return this.mehWindow;

            case HitResult.miss:
                return HitWindow.missWindow;
        }
    }
}
