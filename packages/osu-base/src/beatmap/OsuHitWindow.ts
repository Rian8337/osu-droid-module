import { HitWindow } from "./HitWindow";

/**
 * Represents the hit window of osu!standard.
 */
export class OsuHitWindow extends HitWindow {
    override get greatWindow(): number {
        return Math.floor(80 - 6 * this.overallDifficulty) - 0.5;
    }

    override get okWindow(): number {
        return Math.floor(140 - 8 * this.overallDifficulty) - 0.5;
    }

    override get mehWindow(): number {
        return Math.floor(200 - 10 * this.overallDifficulty) - 0.5;
    }
}
