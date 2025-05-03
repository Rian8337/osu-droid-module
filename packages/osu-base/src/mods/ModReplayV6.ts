import { BeatmapDifficulty } from "../beatmap/sections/BeatmapDifficulty";
import { Beatmap } from "../beatmap/Beatmap";
import { IModApplicableToBeatmap } from "./IModApplicableToBeatmap";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModFacilitatesAdjustment } from "./IModFacilitatesAdjustment";
import { Mod } from "./Mod";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";
import { Circle } from "../beatmap/hitobjects/Circle";
import { HitObject } from "../beatmap/hitobjects/HitObject";
import { Modes } from "../constants/Modes";

/**
 * Represents the Replay V6 mod.
 *
 * Some behavior of beatmap parsing was changed in replay version 7. More specifically, object stacking
 * behavior now matches osu!stable and osu!lazer.
 *
 * This `Mod` is meant to reapply the stacking behavior prior to replay version 7 to a `Beatmap` that
 * was played in replays recorded in version 6 and older for replayability and difficulty calculation.
 */
export class ModReplayV6
    extends Mod
    implements
        IModApplicableToDroid,
        IModApplicableToBeatmap,
        IModFacilitatesAdjustment
{
    override readonly name = "Replay V6";
    override readonly acronym = "RV6";
    readonly droidRanked = false;

    readonly facilitatesAdjustment = true;

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    applyToBeatmap(beatmap: Beatmap) {
        if (beatmap.mode !== Modes.droid) {
            return;
        }

        const { objects } = beatmap.hitObjects;

        if (objects.length === 0) {
            return;
        }

        // Reset stacking
        objects.forEach((h) => {
            h.stackHeight = 0;
        });

        const convertedScale =
            CircleSizeCalculator.standardScaleToOldDroidScale(objects[0].scale);

        for (let i = 0; i < objects.length - 1; ++i) {
            const current = objects[i];
            const next = objects[i + 1];

            this.revertObjectScale(current, beatmap.difficulty);
            this.revertObjectScale(next, beatmap.difficulty);

            if (
                current instanceof Circle &&
                next.startTime - current.startTime <
                    2000 * beatmap.general.stackLeniency &&
                next.position.getDistance(current.position) <
                    Math.sqrt(convertedScale)
            ) {
                next.stackHeight = current.stackHeight + 1;
            }
        }
    }

    private revertObjectScale(
        hitObject: HitObject,
        difficulty: BeatmapDifficulty,
    ) {
        const droidScale = CircleSizeCalculator.standardScaleToOldDroidScale(
            difficulty.cs,
        );

        const radius =
            CircleSizeCalculator.oldDroidScaleToStandardRadius(droidScale);

        const standardCS = CircleSizeCalculator.standardRadiusToStandardCS(
            radius,
            true,
        );

        hitObject.scale = CircleSizeCalculator.standardCSToStandardScale(
            standardCS,
            true,
        );
    }
}
