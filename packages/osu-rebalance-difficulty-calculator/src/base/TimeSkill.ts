import {
    Bin,
    Chandrupatla,
    IterativePoissonBinomial,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { ObjectDifficultySkill } from "./ObjectDifficultySkill";
import { PolynomialPenaltyUtils } from "../utils/PolynomialPenaltyUtils";

/**
 * Processes the difficulty of {@link DifficultyHitObject}s and keeps track of their individual difficulties while
 * considering the time it takes for a player of a given skill level to hit said notes.
 *
 * The way this works is for a given skill level, it works backwards, calculating the difference in time between the
 * current note and the start of the map and calculating the probability of missing on that note. This probability can
 * be seen as the probability of having to "retry" at that note, and therefore the probability multiplied by the time is
 * the effective increase to the time value spent retrying that note contributes.
 *
 * We set a specific time value as our goal, in this case being 20 minutes, and then find the skill level that spends that
 * amount of time retrying before getting a full combo score. That skill level is then used as our star rating.
 */
export abstract class TimeSkill extends ObjectDifficultySkill {
    private readonly msToMinutes = 1 / 60000;

    private readonly timeThresholdMinutes = 24;
    private readonly maxDeltaTime = 50;

    private readonly binThresholdNoteCount = 64;
    private readonly difficultyBinCount = 8;
    private readonly timeBinCount = 16;

    private readonly minimumDifficulty = 1e-4;

    private readonly times: number[] = [];

    private maxDifficulty = 0;

    static difficultyToPerformance(difficulty: number): number {
        return 4 * Math.pow(difficulty, 3);
    }

    override process(current: DifficultyHitObject) {
        super.process(current);

        this.times.push(
            (this.times.at(-1) ?? 0) +
                Math.min(current.deltaTime, this.maxDeltaTime),
        );

        this.maxDifficulty = Math.max(
            this.maxDifficulty,
            this.objectDifficulties.at(-1) ?? 0,
        );
    }

    override difficultyValue(): number {
        if (
            this.objectDifficulties.length === 0 ||
            this.maxDifficulty <= this.minimumDifficulty
        ) {
            return 0;
        }

        // We only use bins if we have enough notes.
        const bins =
            this.objectDifficulties.length > this.binThresholdNoteCount
                ? Bin.createBins(
                      this.objectDifficulties,
                      this.times,
                      this.difficultyBinCount,
                      this.timeBinCount,
                  )
                : null;

        // Lower bound and upper bound are generally unimportant.
        return Chandrupatla.findRootExpand(
            (skill) =>
                this.timeSpentRetryingAtSkill(skill, bins) -
                this.timeThresholdMinutes,
            0,
            10,
        );
    }

    /**
     * Calculates the amount of object difficulties weighed against the top object difficulty.
     *
     * @param difficultyValue The final difficulty value.
     */
    countTopWeightedNoteDifficulties(difficultyValue: number): number {
        if (this.objectDifficulties.length === 0) {
            return 0;
        }

        // This is what the top object difficulty is if all object difficulties were identical.
        // We do not have decay weight in FC time, so we just use the old live one of 0.95.
        const consistentTopNote = difficultyValue * (1 - 0.95);

        if (consistentTopNote === 0) {
            return this.objectDifficulties.length;
        }

        // Use a weighted sum of all strains. Constants are arbitrary and give nice values.
        return this.objectDifficulties.reduce(
            (total, next) =>
                total +
                1.1 / (1 + Math.exp(-10 * (next / consistentTopNote - 0.88))),
        );
    }

    /**
     * Calculates the coefficients of a quartic fitted to the miss counts of each skill level.
     */
    calculateMissPenaltyCoefficients(): number[] {
        const missCounts = new Map<number, number>();

        // If there are no notes, return a zero-polynomial.
        if (this.objectDifficulties.length === 0 || this.maxDifficulty === 0) {
            return [];
        }

        const fcSkill = this.difficultyValue();

        const bins = Bin.createBins(
            this.objectDifficulties,
            this.times,
            this.difficultyBinCount,
            this.timeBinCount,
        );

        for (const skillProportion of PolynomialPenaltyUtils.skillProportions) {
            if (skillProportion === 1) {
                missCounts.set(skillProportion, 0);
                continue;
            }

            const penalizedSkill = fcSkill * skillProportion;

            // We take the log to squash miss counts, which have large absolute value differences
            // but low relative differences, into a straighter line for the polynomial.
            missCounts.set(
                skillProportion,
                Math.log(this.getMissCountAtSkill(penalizedSkill, bins) + 1),
            );
        }

        return PolynomialPenaltyUtils.getPenaltyCoefficients(missCounts);
    }

    /**
     * Calculates the probability for a given skill to hit a note of a given difficulty.
     *
     * @param skill The skill level.
     * @param difficulty The difficulty level.
     * @returns The hit probability.
     */
    protected abstract calculateHitProbability(
        skill: number,
        difficulty: number,
    ): number;

    private timeSpentRetryingAtSkill(
        skill: number,
        bins: Bin[] | null = null,
    ): number {
        if (skill <= 0) {
            return Number.POSITIVE_INFINITY;
        }

        let timeSpentRetrying = 0;
        let hitProbabilityProduct = 1;

        // We use bins, falling back to exact difficulty calculation if not available.
        if (bins !== null) {
            for (
                let timeIndex = this.timeBinCount - 1;
                timeIndex >= 0;
                --timeIndex
            ) {
                const deltaTime = (this.times.at(-1) ?? 0) / this.timeBinCount;

                for (
                    let difficultyIndex = 0;
                    difficultyIndex < this.difficultyBinCount;
                    ++difficultyIndex
                ) {
                    const bin =
                        bins[
                            this.difficultyBinCount * timeIndex +
                                difficultyIndex
                        ];

                    hitProbabilityProduct *= Math.pow(
                        this.calculateHitProbability(skill, bin.difficulty),
                        bin.noteCount,
                    );
                }

                timeSpentRetrying +=
                    deltaTime / hitProbabilityProduct - deltaTime;
            }
        } else {
            for (let i = this.objectDifficulties.length - 1; i >= 0; --i) {
                const deltaTime =
                    i > 0 ? this.times[i] - this.times[i - 1] : this.times[i];

                hitProbabilityProduct *= this.calculateHitProbability(
                    skill,
                    this.objectDifficulties[i],
                );

                timeSpentRetrying +=
                    deltaTime / hitProbabilityProduct - deltaTime;
            }
        }

        return timeSpentRetrying * this.msToMinutes;
    }

    /**
     * Finds the lowest miss count that a player with the given
     * skill would likely achieve within 12 minutes of retrying.
     */
    private getMissCountAtSkill(skill: number, bins: Bin[]): number {
        if (this.maxDifficulty === 0) {
            return 0;
        }

        const endTime = this.times.at(-1) ?? 0;

        if (endTime <= 0) {
            return this.objectDifficulties.length;
        }

        const poiBin = new IterativePoissonBinomial();

        const retryTimeRequiredToObtainMissCount = (
            missCount: number,
        ): number => {
            poiBin.reset();

            let timeSpentRetrying = 0;

            if (
                this.objectDifficulties.length >
                this.timeBinCount * this.difficultyBinCount
            ) {
                const binTimeStep = endTime / this.timeBinCount;

                for (
                    let timeIndex = 0;
                    timeIndex < this.timeBinCount;
                    ++timeIndex
                ) {
                    for (
                        let difficultyIndex = 0;
                        difficultyIndex < this.difficultyBinCount;
                        ++difficultyIndex
                    ) {
                        const bin =
                            bins[
                                timeIndex * this.difficultyBinCount +
                                    difficultyIndex
                            ];

                        const missProbability =
                            1 -
                            this.calculateHitProbability(skill, bin.difficulty);

                        poiBin.addBinnedProbabilities(
                            missProbability,
                            bin.noteCount,
                        );
                    }

                    timeSpentRetrying += binTimeStep * poiBin.cdf(missCount);
                }
            } else {
                for (let i = 0; i < this.objectDifficulties.length; ++i) {
                    const deltaTime =
                        i > 0
                            ? this.times[i] - this.times[i - 1]
                            : this.times[i];

                    const missProbability =
                        1 -
                        this.calculateHitProbability(
                            skill,
                            this.objectDifficulties[i],
                        );

                    poiBin.addProbability(missProbability);

                    timeSpentRetrying += deltaTime * poiBin.cdf(missCount);
                }
            }

            const finalCdf = poiBin.cdf(missCount);

            if (finalCdf < 1e-10) {
                return Number.POSITIVE_INFINITY;
            }

            return (timeSpentRetrying / finalCdf - endTime) * this.msToMinutes;
        };

        return Math.max(
            0,
            Chandrupatla.findRootExpand(
                (x) =>
                    retryTimeRequiredToObtainMissCount(x) -
                    this.timeThresholdMinutes,
                -50,
                1000,
                { accuracy: 0.01 },
            ),
        );
    }
}
