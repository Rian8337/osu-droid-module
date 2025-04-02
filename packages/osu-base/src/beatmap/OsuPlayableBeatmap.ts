import { HitWindow } from "./HitWindow";
import { OsuHitWindow } from "./OsuHitWindow";
import { PlayableBeatmap } from "./PlayableBeatmap";

/**
 * Represents a `PlayableBeatmap` for osu!standard.
 */
export class OsuPlayableBeatmap extends PlayableBeatmap {
    protected override createHitWindow(): HitWindow {
        return new OsuHitWindow(this.difficulty.od);
    }
}
