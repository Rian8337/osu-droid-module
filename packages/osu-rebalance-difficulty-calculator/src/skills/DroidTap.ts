import {
    OsuHitWindow,
    Mod,
    Spinner,
    Interpolation,
    MathUtils,
} from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends DroidSkill {
    protected override readonly skillMultiplier: number = 1375;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 1.1;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private currentTapStrain: number = 0;
    private currentOriginalTapStrain: number = 0;

    private readonly hitWindow: OsuHitWindow;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.hitWindow = new OsuHitWindow(overallDifficulty);
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let strainTime: number = current.strainTime;

        const greatWindowFull: number = this.hitWindow.hitWindowFor300() * 2;

        // Aim to nerf cheesy rhythms (very fast consecutive doubles with large deltatimes between).
        if (
            this.previous[0] &&
            strainTime < greatWindowFull &&
            this.previous[0].strainTime > strainTime
        ) {
            strainTime = Interpolation.lerp(
                this.previous[0].strainTime,
                strainTime,
                strainTime / greatWindowFull
            );
        }

        // Cap deltatime to the OD 300 hitwindow.
        // 0.58 is derived from making sure 260 BPM 1/4 OD5 streams aren't nerfed harshly, whilst 0.91 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / greatWindowFull / 0.58,
            0.91,
            1
        );

        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        let originalSpeedBonus: number = 1;

        if (current.strainTime < this.minSpeedBonus) {
            originalSpeedBonus +=
                0.75 *
                Math.pow((this.minSpeedBonus - current.strainTime) / 40, 2);
        }

        const decay: number = this.strainDecay(current.deltaTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain +=
            this.tapStrainOf(speedBonus, strainTime) * this.skillMultiplier;

        this.currentOriginalTapStrain *= decay;
        this.currentOriginalTapStrain +=
            this.tapStrainOf(originalSpeedBonus, current.strainTime) *
            this.skillMultiplier;
        this.currentOriginalTapStrain *= current.rhythmMultiplier;

        return this.currentTapStrain * current.rhythmMultiplier;
    }

    /**
     * Calculates the tap strain of a hitobject given a specific speed bonus and strain time.
     */
    private tapStrainOf(speedBonus: number, strainTime: number): number {
        return speedBonus / strainTime;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        return this.strainValueOf(current);
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.currentStrain;
        current.originalTapStrain = this.currentOriginalTapStrain;
    }
}
