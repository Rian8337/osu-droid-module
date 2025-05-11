import { Circle } from "../hitobjects/Circle";
import { PlaceableHitObject } from "../hitobjects/PlaceableHitObject";
import { Slider } from "../hitobjects/Slider";
import { Spinner } from "../hitobjects/Spinner";

/**
 * Contains information about hit objects of a beatmap.
 */
export class BeatmapHitObjects {
    /**
     * The objects of the beatmap.
     */
    objects: PlaceableHitObject[] = [];

    private _circles = 0;

    /**
     * The amount of circles in the beatmap.
     */
    get circles(): number {
        return this._circles;
    }

    private _sliders = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    get sliders(): number {
        return this._sliders;
    }

    private _spinners = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    get spinners(): number {
        return this._spinners;
    }

    /**
     * The amount of slider ticks in the beatmap.
     *
     * This iterates through all objects and should be stored locally or used sparingly.
     */
    get sliderTicks(): number {
        return this.objects.reduce(
            (acc, cur) => (cur instanceof Slider ? acc + cur.ticks : acc),

            0,
        );
    }

    /**
     * The amount of sliderends in the beatmap.
     */
    get sliderEnds(): number {
        return this.sliders;
    }

    /**
     * The amount of slider repeat points in the beatmap.
     *
     * This iterates through all objects and should be stored locally or used sparingly.
     */
    get sliderRepeatPoints(): number {
        return this.objects.reduce(
            (acc, cur) => (cur instanceof Slider ? acc + cur.repeatCount : acc),

            0,
        );
    }

    /**
     * Adds hitobjects.
     *
     * The sorting order of hitobjects will be maintained.
     *
     * @param objects The hitobjects to add.
     */
    add(...objects: PlaceableHitObject[]): void {
        for (const object of objects) {
            // Objects may be out of order *only* if a user has manually edited an .osu file.
            // Unfortunately there are "ranked" maps in this state (example: https://osu.ppy.sh/s/594828).
            // Finding index is used to guarantee that the parsing order of hitobjects with equal start times is maintained (stably-sorted).
            this.objects.splice(
                this.findInsertionIndex(object.startTime),
                0,
                object,
            );

            if (object instanceof Circle) {
                ++this._circles;
            } else if (object instanceof Slider) {
                ++this._sliders;
            } else {
                ++this._spinners;
            }
        }
    }

    /**
     * Removes a hitobject at an index.
     *
     * @param index The index of the hitobject to remove.
     * @returns The hitobject that was removed, `null` if no hitobject was removed.
     */
    removeAt(index: number): PlaceableHitObject | null {
        const object = this.objects.splice(index, 1)[0] ?? null;

        if (object instanceof Circle) {
            --this._circles;
        } else if (object instanceof Slider) {
            --this._sliders;
        } else if (object instanceof Spinner) {
            --this._spinners;
        }

        return object;
    }

    /**
     * Clears all hitobjects.
     */
    clear(): void {
        this.objects.length = 0;
        this._circles = 0;
        this._sliders = 0;
        this._spinners = 0;
    }

    [Symbol.iterator](): IterableIterator<PlaceableHitObject> {
        return this.objects[Symbol.iterator]();
    }

    /**
     * Finds the insertion index of a hitobject in a given time.
     *
     * @param startTime The start time of the hitobject.
     */
    private findInsertionIndex(startTime: number): number {
        if (
            this.objects.length === 0 ||
            startTime < this.objects[0].startTime
        ) {
            return 0;
        }

        if (startTime >= this.objects.at(-1)!.startTime) {
            return this.objects.length;
        }

        let l = 0;
        let r = this.objects.length - 2;

        while (l <= r) {
            const pivot = l + ((r - l) >> 1);

            if (this.objects[pivot].startTime < startTime) {
                l = pivot + 1;
            } else if (this.objects[pivot].startTime > startTime) {
                r = pivot - 1;
            } else {
                return pivot;
            }
        }

        return l;
    }
}
