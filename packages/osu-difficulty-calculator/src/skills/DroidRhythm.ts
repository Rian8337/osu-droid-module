import { Mod, OsuHitWindow, Slider, Spinner } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to properly follow a beatmap's rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected override readonly historyLength: number = 32;
    protected override readonly skillMultiplier: number = 1;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 2;

    private readonly rhythmMultiplier: number = 0.75;
    private readonly historyTimeMax: number = 5000; // 5 seconds of calculateRhythmBonus max.
    private currentRhythm: number = 1;
    private readonly hitWindow: OsuHitWindow;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.hitWindow = new OsuHitWindow(overallDifficulty);
    }

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
     */
    private calculateRhythmBonus(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let previousIslandSize: number = 0;
        let rhythmComplexitySum: number = 0;
        let islandSize: number = 1;

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio: number = 0;

        let firstDeltaSwitch: boolean = false;

        let rhythmStart: number = 0;

        while (
            rhythmStart < this.previous.length - 2 &&
            current.startTime - this.previous[rhythmStart].startTime <
                this.historyTimeMax
        ) {
            ++rhythmStart;
        }

        for (let i = rhythmStart; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay: number =
                (this.historyTimeMax -
                    (current.startTime - this.previous[i - 1].startTime)) /
                this.historyTimeMax;

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (this.previous.length - i) / this.previous.length
            );

            const currentDelta: number = this.previous[i - 1].strainTime;
            const prevDelta: number = this.previous[i].strainTime;
            const lastDelta: number = this.previous[i + 1].strainTime;

            const currentRatio: number =
                1 +
                6 *
                    Math.min(
                        0.5,
                        Math.pow(
                            Math.sin(
                                Math.PI /
                                    (Math.min(prevDelta, currentDelta) /
                                        Math.max(prevDelta, currentDelta))
                            ),
                            2
                        )
                    );

            const windowPenalty: number = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) -
                        this.hitWindow.hitWindowFor300() * 0.6
                ) /
                    (this.hitWindow.hitWindowFor300() * 0.6)
            );

            let effectiveRatio: number = windowPenalty * currentRatio;

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
                    if (this.previous[i - 1].object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 8;
                    }

                    if (this.previous[i].object instanceof Slider) {
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

    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentRhythm = this.calculateRhythmBonus(current);

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += this.currentRhythm - 1;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
