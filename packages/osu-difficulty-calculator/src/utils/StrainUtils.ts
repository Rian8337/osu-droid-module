import { MathUtils } from "@rian8337/osu-base";

export abstract class StrainUtils {
    static countTopWeightedSliders(
        sliderStrains: number[],
        difficultyValue: number,
    ): number {
        if (sliderStrains.length === 0) {
            return 0;
        }

        const consistentTopStrain = difficultyValue / 10;

        if (consistentTopStrain === 0) {
            return 0;
        }

        // Use a weighted sum of all strains. Constants are arbitrary and give nice values
        return sliderStrains.reduce(
            (total, next) =>
                total +
                MathUtils.offsetLogistic(
                    next / consistentTopStrain,
                    0.88,
                    10,
                    1.1,
                ),
        );
    }
}
