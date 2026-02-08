import { Utils } from "../utils/Utils";
import { MathUtils } from "./MathUtils";

export class Bin {
    difficulty = 0;
    time = 0;
    noteCount = 0;

    /**
     * Creates a 2D grid of bins using bilinear interpolation.
     *
     * Notes are distributed across neighboring bins weighted by their fractional position.
     */
    static createBins(
        difficulties: readonly number[],
        times: readonly number[],
        difficultyDimensionLength: number,
        timeDimensionLength: number,
    ): Bin[] {
        const maxDifficulty = MathUtils.max(difficulties);
        const endTime = MathUtils.max(times);

        const bins = Utils.initializeArray(
            timeDimensionLength * difficultyDimensionLength,
            () => new Bin(),
        );

        for (let timeIndex = 0; timeIndex < timeDimensionLength; ++timeIndex) {
            const time = (endTime * timeIndex) / (timeDimensionLength - 1);

            for (
                let diffIndex = 0;
                diffIndex < difficultyDimensionLength;
                ++diffIndex
            ) {
                const binIndex =
                    difficultyDimensionLength * timeIndex + diffIndex;

                bins[binIndex].time = time;

                // We do not create a 0 difficulty bin because 0 difficulty notes do not contribute to star rating.
                bins[binIndex].difficulty =
                    (maxDifficulty * (diffIndex + 1)) /
                    difficultyDimensionLength;
            }
        }

        for (let noteIndex = 0; noteIndex < difficulties.length; ++noteIndex) {
            const timeBinIndex =
                timeDimensionLength * (times[noteIndex] / endTime);

            const difficultyBinIndex =
                difficultyDimensionLength *
                    (difficulties[noteIndex] / maxDifficulty) -
                1;

            const timeLower = Math.min(
                Math.trunc(timeBinIndex),
                timeDimensionLength - 1,
            );
            const timeUpper = Math.min(timeLower + 1, timeDimensionLength - 1);
            const timeWeight = timeBinIndex - timeLower;

            const difficultyLower = Math.floor(difficultyBinIndex);

            const difficultyUpper = Math.min(
                difficultyLower + 1,
                difficultyDimensionLength - 1,
            );

            const difficultyWeight = difficultyBinIndex - difficultyLower;

            // The lower bound of difficulty can be -1, corresponding to buckets with 0 difficulty.
            // We do not store those since they do not contribute to star rating.
            if (difficultyLower >= 0) {
                bins[
                    difficultyDimensionLength * timeLower + difficultyLower
                ].noteCount += (1 - timeWeight) * (1 - difficultyWeight);

                bins[
                    difficultyDimensionLength * timeUpper + difficultyLower
                ].noteCount += timeWeight * (1 - difficultyWeight);
            }

            bins[
                difficultyDimensionLength * timeLower + difficultyUpper
            ].noteCount += (1 - timeWeight) * difficultyWeight;

            bins[
                difficultyDimensionLength * timeUpper + difficultyUpper
            ].noteCount += timeWeight * difficultyWeight;
        }

        return bins;
    }
}
