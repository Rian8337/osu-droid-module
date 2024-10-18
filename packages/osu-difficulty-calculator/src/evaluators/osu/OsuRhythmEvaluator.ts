import { Spinner, Slider } from "@rian8337/osu-base";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * An evaluator for calculating osu!standard Rhythm skill.
 */
export abstract class OsuRhythmEvaluator {
    private static readonly rhythmMultiplier = 0.75;
    private static readonly historyTimeMax = 5000; // 5 seconds of calculateRhythmBonus max.

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated
     * with historic data of the current object.
     *
     * @param current The current object.
     * @param greatWindow The great hit window of the current object.
     */
    static evaluateDifficultyOf(current: OsuDifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let previousIslandSize = 0;
        let rhythmComplexitySum = 0;
        let islandSize = 1;

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio = 0;
        let firstDeltaSwitch = false;
        const historicalNoteCount = Math.min(current.index, 32);
        let rhythmStart = 0;

        while (
            rhythmStart < historicalNoteCount - 2 &&
            current.startTime - current.previous(rhythmStart)!.startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        for (let i = rhythmStart; i > 0; --i) {
            const currentObject = current.previous(i - 1)!;
            const prevObject = current.previous(i)!;
            const lastObject = current.previous(i + 1)!;

            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay =
                (this.historyTimeMax -
                    (current.startTime - currentObject.startTime)) /
                this.historyTimeMax;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (historicalNoteCount - i) / historicalNoteCount,
            );

            const currentDelta = currentObject.strainTime;
            const prevDelta = prevObject.strainTime;
            const lastDelta = lastObject.strainTime;

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
                    if (currentObject.object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 8;
                    }

                    if (prevObject.object instanceof Slider) {
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

        return Math.sqrt(4 + rhythmComplexitySum * this.rhythmMultiplier) / 2;
    }
}
