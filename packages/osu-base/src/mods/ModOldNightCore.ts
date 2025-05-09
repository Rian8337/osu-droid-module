import { ModNightCore } from "./ModNightCore";

/**
 * Represents the "old" `ModNightCore`.
 *
 * This mod is used solely for osu!droid difficulty calculation of replays with version 3 or older. The reason behind this
 * is a bug that was patched in replay version 4, where all audio that did not have 44100Hz frequency would slow down.
 *
 * After some testing, it was discovered that such replays were played at 1.39x speed instead of 1.5x, which is
 * represented by this mod.
 */
export class ModOldNightCore extends ModNightCore {
    constructor() {
        super();

        this.trackRateMultiplier.value = 1.39;
    }

    override calculateDroidScoreMultiplier(): number {
        return 1.12;
    }
}
