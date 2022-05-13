import { HitObject } from "../hitobjects/HitObject";
import { Slider } from "../hitobjects/Slider";

/**
 * Contains information about hit objects of a beatmap.
 */
export class BeatmapHitObjects {
    /**
     * The objects of the beatmap.
     */
    readonly objects: HitObject[] = [];

    /**
     * The amount of circles in the beatmap.
     */
    circles: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners: number = 0;

    /**
     * The amount of slider ticks in the beatmap.
     */
    get sliderTicks(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );

        return sliders.reduce((acc, value) => acc + value.ticks, 0);
    }

    /**
     * The amount of sliderends in the beatmap.
     */
    get sliderEnds(): number {
        return this.sliders;
    }

    /**
     * The amount of slider repeat points in the beatmap.
     */
    get sliderRepeatPoints(): number {
        const sliders: Slider[] = <Slider[]>(
            this.objects.filter((v) => v instanceof Slider)
        );

        return sliders.reduce((acc, value) => acc + value.repeats, 0);
    }
}
