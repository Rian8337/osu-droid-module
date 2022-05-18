import { Circle } from "../hitobjects/Circle";
import { HitObject } from "../hitobjects/HitObject";
import { Slider } from "../hitobjects/Slider";
import { SliderRepeat } from "../hitobjects/sliderObjects/SliderRepeat";
import { SliderTick } from "../hitobjects/sliderObjects/SliderTick";
import { Spinner } from "../hitobjects/Spinner";

/**
 * Contains information about hit objects of a beatmap.
 */
export class BeatmapHitObjects {
    private _objects: HitObject[] = [];

    /**
     * The objects of the beatmap.
     */
    get objects(): readonly HitObject[] {
        return this._objects;
    }

    private _circles: number = 0;

    /**
     * The amount of circles in the beatmap.
     */
    get circles(): number {
        return this._circles;
    }

    private _sliders: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    get sliders(): number {
        return this._sliders;
    }

    private _spinners: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    get spinners(): number {
        return this._spinners;
    }

    private _sliderTicks: number = 0;

    /**
     * The amount of slider ticks in the beatmap.
     */
    get sliderTicks(): number {
        return this._sliderTicks;
    }

    /**
     * The amount of sliderends in the beatmap.
     */
    get sliderEnds(): number {
        return this.sliders;
    }

    private _sliderRepeatPoints: number = 0;

    /**
     * The amount of slider repeat points in the beatmap.
     */
    get sliderRepeatPoints(): number {
        return this._sliderRepeatPoints;
    }

    /**
     * Adds hitobjects.
     *
     * The sorting order of hitobjects will be maintained.
     *
     * @param objects The hitobjects to add.
     */
    add(...objects: HitObject[]): void {
        for (const object of objects) {
            // Objects may be out of order *only* if a user has manually edited an .osu file.
            // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
            // Finding index is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
            this._objects.splice(
                this.findInsertionIndex(object.startTime),
                0,
                object
            );

            if (object instanceof Circle) {
                ++this._circles;
            } else if (object instanceof Slider) {
                ++this._sliders;

                for (const nestedHitObject of object.nestedHitObjects) {
                    if (nestedHitObject instanceof SliderTick) {
                        ++this._sliderTicks;
                    } else if (nestedHitObject instanceof SliderRepeat) {
                        ++this._sliderRepeatPoints;
                    }
                }
            } else if (object instanceof Spinner) {
                ++this._spinners;
            }
        }
    }

    /**
     * Removes a hitobject at an index.
     *
     * @param index The index of the hitobject to remove.
     * @returns The hitobject that was removed.
     */
    removeAt(index: number): HitObject {
        const object: HitObject = this._objects.splice(index, 1)[0];

        if (object instanceof Circle) {
            --this._circles;
        } else if (object instanceof Slider) {
            --this._sliders;

            for (const nestedHitObject of object.nestedHitObjects) {
                if (nestedHitObject instanceof SliderTick) {
                    --this._sliderTicks;
                } else if (nestedHitObject instanceof SliderRepeat) {
                    --this._sliderRepeatPoints;
                }
            }
        } else if (object instanceof Spinner) {
            --this._spinners;
        }

        return object;
    }

    /**
     * Clears all hitobjects.
     */
    clear(): void {
        this._objects.length = 0;
        this._circles = 0;
        this._sliders = 0;
        this._spinners = 0;
        this._sliderTicks = 0;
        this._sliderRepeatPoints = 0;
    }

    /**
     * Finds the insertion index of a hitobject in a given time.
     *
     * @param startTime The start time of the hitobject.
     */
    private findInsertionIndex(startTime: number): number {
        for (let i = 0; i < this.objects.length; ++i) {
            if (this.objects[i].startTime > startTime) {
                return i - 1;
            }
        }

        return this.objects.length;
    }
}
