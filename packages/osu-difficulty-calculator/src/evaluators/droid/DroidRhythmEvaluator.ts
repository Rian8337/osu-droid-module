import { Spinner, Slider } from "@rian8337/osu-base";
import { RhythmEvaluator } from "../base/RhythmEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

/**
 * An evaluator for calculating osu!droid Rhythm skill.
 */
export abstract class DroidRhythmEvaluator extends RhythmEvaluator {
    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     */
    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        if (
            current.object instanceof Spinner ||
            // Exclude overlapping objects that can be tapped at once.
            current.isOverlapping(false)
        ) {
            return 1;
        }

        let previousIslandSize = 0;
        let rhythmComplexitySum = 0;
        let islandSize = 1;

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio = 0;
        let firstDeltaSwitch = false;
        let rhythmStart = 0;

        const historicalNoteCount = Math.min(current.index, 32);

        // Exclude overlapping objects that can be tapped at once.
        const validPrevious: DroidDifficultyHitObject[] = [];

        for (let i = 0; i < historicalNoteCount; ++i) {
            const object = current.previous(i);

            if (!object) {
                break;
            }

            if (!object.isOverlapping(false)) {
                validPrevious.push(object);
            }
        }

        while (
            rhythmStart < validPrevious.length - 2 &&
            current.startTime - validPrevious[rhythmStart].startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        for (let i = rhythmStart; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay =
                (this.historyTimeMax -
                    (current.startTime - validPrevious[i - 1].startTime)) /
                this.historyTimeMax;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (validPrevious.length - i) / validPrevious.length,
            );

            const currentDelta = validPrevious[i - 1].strainTime;
            const prevDelta = validPrevious[i].strainTime;
            const lastDelta = validPrevious[i + 1].strainTime;

            const currentRatio =
                1 +
                6 *
                    Math.min(
                        0.5,
                        Math.pow(
                            Math.sin(
                                Math.PI /
                                    (Math.min(prevDelta, currentDelta) /
                                        Math.max(prevDelta, currentDelta)),
                            ),
                            2,
                        ),
                    );

            const windowPenalty = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) -
                        current.fullGreatWindow * 0.3,
                ) /
                    (current.fullGreatWindow * 0.3),
            );

            let effectiveRatio = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (
                    prevDelta <= 1.25 * currentDelta &&
                    prevDelta * 1.25 >= currentDelta
                ) {
                    // Island is still progressing, count size.
                    if (islandSize < 7) {
                        ++islandSize;
                    }
                } else {
                    if (validPrevious[i - 1].object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 8;
                    }

                    if (validPrevious[i].object instanceof Slider) {
                        // BPM change was from a slider, this is typically easier than circle -> circle.
                        effectiveRatio /= 4;
                    }

                    if (previousIslandSize === islandSize) {
                        // Repeated island size (ex: triplet -> triplet).
                        effectiveRatio /= 4;
                    }

                    if (previousIslandSize % 2 === islandSize % 2) {
                        // Repeated island polarity (2 -> 4, 3 -> 5).
                        effectiveRatio /= 2;
                    }

                    if (
                        lastDelta > prevDelta + 10 &&
                        prevDelta > currentDelta + 10
                    ) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    rhythmComplexitySum +=
                        (((Math.sqrt(effectiveRatio * startRatio) *
                            currentHistoricalDecay *
                            Math.sqrt(4 + islandSize)) /
                            2) *
                            Math.sqrt(4 + previousIslandSize)) /
                        2;

                    startRatio = effectiveRatio;

                    previousIslandSize = islandSize;

                    if (prevDelta * 1.25 < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    islandSize = 1;
                }
            } else if (prevDelta > 1.25 * currentDelta) {
                // We want to be speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;
                startRatio = effectiveRatio;
                islandSize = 1;
            }
        }

        // Nerf doubles that can be tapped at the same time to get Great hit results.
        const next = current.next(0);
        let doubletapness = 1;

        if (next) {
            const currentDeltaTime = Math.max(1, current.deltaTime);
            const nextDeltaTime = Math.max(1, next.deltaTime);
            const deltaDifference = Math.abs(nextDeltaTime - currentDeltaTime);
            const speedRatio =
                currentDeltaTime / Math.max(currentDeltaTime, deltaDifference);
            const windowRatio = Math.pow(
                Math.min(1, currentDeltaTime / current.fullGreatWindow),
                2,
            );
            doubletapness = Math.pow(speedRatio, 1 - windowRatio);
        }

        return (
            Math.sqrt(
                4 + rhythmComplexitySum * this.rhythmMultiplier * doubletapness,
            ) / 2
        );
    }
}
