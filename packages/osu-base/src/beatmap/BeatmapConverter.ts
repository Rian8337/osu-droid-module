import { Beatmap } from "./Beatmap";
import { Circle } from "./hitobjects/Circle";
import { PlaceableHitObject } from "./hitobjects/PlaceableHitObject";
import { Slider } from "./hitobjects/Slider";
import { Spinner } from "./hitobjects/Spinner";
import { BeatmapDifficulty } from "./sections/BeatmapDifficulty";
import { BeatmapHitObjects } from "./sections/BeatmapHitObjects";

/**
 * Converts a beatmap for another mode.
 */
export class BeatmapConverter {
    readonly beatmap: Beatmap;

    constructor(beatmap: Beatmap) {
        this.beatmap = beatmap;
    }

    /**
     * Converts the beatmap.
     *
     * @returns The converted beatmap.
     */
    convert(): Beatmap {
        const converted = new Beatmap(this.beatmap);

        // Shallow clone isn't enough to ensure we don't mutate some beatmap properties unexpectedly.
        converted.difficulty = new BeatmapDifficulty(this.beatmap.difficulty);
        converted.hitObjects = this.convertHitObjects();

        return converted;
    }

    private convertHitObjects(): BeatmapHitObjects {
        const hitObjects = new BeatmapHitObjects();

        this.beatmap.hitObjects.objects.forEach((hitObject) => {
            hitObjects.add(this.convertHitObject(hitObject));
        });

        return hitObjects;
    }

    private convertHitObject(
        hitObject: PlaceableHitObject,
    ): PlaceableHitObject {
        let object: PlaceableHitObject;

        if (hitObject instanceof Circle) {
            object = new Circle({
                startTime: hitObject.startTime,
                position: hitObject.position,
                newCombo: hitObject.isNewCombo,
                type: hitObject.type,
                comboOffset: hitObject.comboOffset,
            });
        } else if (hitObject instanceof Slider) {
            object = new Slider({
                startTime: hitObject.startTime,
                position: hitObject.position,
                newCombo: hitObject.isNewCombo,
                type: hitObject.type,
                path: hitObject.path,
                repeatCount: hitObject.repeatCount,
                nodeSamples: hitObject.nodeSamples,
                comboOffset: hitObject.comboOffset,
                tickDistanceMultiplier:
                    // Prior to v8, speed multipliers don't adjust for how many ticks are generated over the same distance.
                    // This results in more (or less) ticks being generated in <v8 maps for the same time duration.
                    this.beatmap.formatVersion < 8
                        ? 1 /
                          this.beatmap.controlPoints.difficulty.controlPointAt(
                              hitObject.startTime,
                          ).speedMultiplier
                        : 1,
            });
        } else {
            object = new Spinner({
                startTime: hitObject.startTime,
                endTime: hitObject.endTime,
                type: hitObject.type,
            });
        }

        object.samples = hitObject.samples;
        object.auxiliarySamples = hitObject.auxiliarySamples;

        return object;
    }
}
