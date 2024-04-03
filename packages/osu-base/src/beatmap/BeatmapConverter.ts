import { Modes } from "../constants/Modes";
import { ModDifficultyAdjust } from "../mods/ModDifficultyAdjust";
import { Beatmap } from "./Beatmap";
import { BeatmapConverterOptions } from "./BeatmapConverterOptions";
import { BeatmapProcessor } from "./BeatmapProcessor";
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
     * @param options The options to use for conversion.
     * @returns The converted beatmap.
     */
    convert(options?: BeatmapConverterOptions): Beatmap {
        const mods = options?.mods ?? [];
        const mode = options?.mode ?? Modes.osu;
        const customSpeedMultiplier = options?.customSpeedMultiplier ?? 1;

        // Convert
        const converted = new Beatmap(this.beatmap);

        // Shallow clone isn't enough to ensure we don't mutate some beatmap properties unexpectedly.
        converted.difficulty = new BeatmapDifficulty(this.beatmap.difficulty);
        converted.hitObjects = this.convertHitObjects();

        // Apply difficulty mods
        mods.forEach((mod) => {
            if (mod.isApplicableToDifficulty()) {
                mod.applyToDifficulty(mode, converted.difficulty);
            }
        });

        // Special handling for difficulty adjust mod where difficulty statistics are forced.
        const difficultyAdjustMod = mods.find(
            (m) => m instanceof ModDifficultyAdjust,
        ) as ModDifficultyAdjust | undefined;
        difficultyAdjustMod?.applyToDifficulty(mode, converted.difficulty);

        mods.forEach((mod) => {
            if (mod.isApplicableToDifficultyWithSettings()) {
                mod.applyToDifficultyWithSettings(
                    mode,
                    converted.difficulty,
                    mods,
                    customSpeedMultiplier,
                );
            }
        });

        const processor = new BeatmapProcessor(converted);

        // Compute default values for hit objects, including creating nested hit objects in-case they're needed.
        converted.hitObjects.objects.forEach((hitObject) =>
            hitObject.applyDefaults(
                converted.controlPoints,
                converted.difficulty,
                mode,
            ),
        );

        mods.forEach((mod) => {
            if (mod.isApplicableToHitObject()) {
                for (const hitObject of converted.hitObjects.objects) {
                    mod.applyToHitObject(mode, hitObject);
                }
            }
        });

        processor.postProcess(mode);

        mods.forEach((mod) => {
            if (mod.isApplicableToBeatmap()) {
                mod.applyToBeatmap(converted);
            }
        });

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

        return object;
    }
}
