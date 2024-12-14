import { Modes } from "../../../constants/Modes";
import { Vector2 } from "../../../math/Vector2";
import { EmptyHitWindow } from "../../../utils/EmptyHitWindow";
import { HitWindow } from "../../../utils/HitWindow";
import { BeatmapControlPoints } from "../../sections/BeatmapControlPoints";
import { BeatmapDifficulty } from "../../sections/BeatmapDifficulty";
import { SliderNestedHitObject } from "./SliderNestedHitObject";

/**
 * Represents a nested hit object that is at the end of a slider path (either repeat or tail).
 */
export abstract class SliderEndCircle extends SliderNestedHitObject {
    private readonly sliderSpanDuration: number;
    private readonly sliderStartTime: number;

    constructor(values: {
        sliderSpanDuration: number;
        sliderStartTime: number;
        position: Vector2;
        startTime: number;
        spanIndex: number;
        spanStartTime: number;
    }) {
        super(values);

        this.sliderSpanDuration = values.sliderSpanDuration;
        this.sliderStartTime = values.sliderStartTime;
    }

    override applyDefaults(
        controlPoints: BeatmapControlPoints,
        difficulty: BeatmapDifficulty,
        mode: Modes,
    ): void {
        super.applyDefaults(controlPoints, difficulty, mode);

        if (this.spanIndex > 0) {
            // Repeat points after the first span should appear behind the still-visible one.
            this.timeFadeIn = 0;

            // The next end circle should appear exactly after the previous circle (on the same end) is hit.
            this.timePreempt = this.sliderSpanDuration * 2;
        } else {
            // The first end circle should fade in with the slider.
            this.timePreempt += this.startTime - this.sliderStartTime;
        }
    }

    protected override createHitWindow(): HitWindow | null {
        return new EmptyHitWindow();
    }
}
