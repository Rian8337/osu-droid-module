import { Modes } from "../../../constants/Modes";
import { EmptyHitWindow } from "../../../utils/EmptyHitWindow";
import { HitWindow } from "../../../utils/HitWindow";
import { BeatmapControlPoints } from "../../sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "../../sections/BeatmapDifficulty";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents a slider tick in a slider.
 */
export class SliderTick extends SliderNestedHitObject {
    override applyDefaults(
        controlPoints: BeatmapControlPoints,
        difficulty: BeatmapDifficulty,
        mode: Modes,
    ): void {
        super.applyDefaults(controlPoints, difficulty, mode);

        let offset: number;

        if (this.spanIndex > 0) {
            // Adding 200 to include the offset stable used.
            // This is so on repeats ticks don't appear too late to be visually processed by the player.
            offset = 200;
        } else {
            offset = this.timePreempt * 0.66;
        }

        this.timePreempt = (this.startTime - this.spanStartTime) / 2 + offset;
    }

    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }
}
