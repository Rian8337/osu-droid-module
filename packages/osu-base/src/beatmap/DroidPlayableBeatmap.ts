import { ModPrecise } from "../mods/ModPrecise";
import { DroidHitWindow } from "./DroidHitWindow";
import { HitWindow } from "./HitWindow";
import { PlayableBeatmap } from "./PlayableBeatmap";
import { PreciseDroidHitWindow } from "./PreciseDroidHitWindow";

/**
 * Representsa a `PlayableBeatmap` for osu!droid.
 */
export class DroidPlayableBeatmap extends PlayableBeatmap {
    protected override createHitWindow(): HitWindow {
        if (this.mods.some((m) => m instanceof ModPrecise)) {
            return new PreciseDroidHitWindow(this.difficulty.od);
        } else {
            return new DroidHitWindow(this.difficulty.od);
        }
    }
}
