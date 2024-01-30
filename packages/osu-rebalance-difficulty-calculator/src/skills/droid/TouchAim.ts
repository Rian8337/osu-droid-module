import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { TouchProbability } from "./TouchProbability";
import { TouchSkill } from "./TouchSkill";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { RawTouchAim } from "./RawTouchAim";
import { RawTouchTap } from "./RawTouchTap";

export class TouchAim extends TouchSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly starsPerDouble = 1.05;

    private readonly clockRate: number;
    private readonly greatWindow: number;
    private readonly isForceAR: boolean;
    private readonly withSliders: boolean;

    private currentAimStrain = 0;

    constructor(
        mods: Mod[],
        clockRate: number,
        overallDifficulty: number,
        isForceAR: boolean,
        withSliders: boolean,
    ) {
        super(mods);

        this.clockRate = clockRate;
        this.greatWindow = new OsuHitWindow(
            overallDifficulty,
        ).hitWindowFor300();
        this.isForceAR = isForceAR;

        this.withSliders = withSliders;
    }

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        this.currentAimStrain = super.strainValueAt(current);

        return this.currentAimStrain;
    }

    protected override getRawSkills() {
        return [
            new RawTouchAim(
                this.mods,
                this.clockRate,
                this.isForceAR,
                this.withSliders,
            ),
            new RawTouchTap(
                this.mods,
                this.clockRate,
                this.isForceAR,
                this.greatWindow,
                true,
            ),
        ];
    }

    protected override getProbabilityStrain(probability: TouchProbability) {
        return probability.skills[0].currentStrain;
    }

    protected override getProbabilityTotalStrain(
        probability: TouchProbability,
    ) {
        return this.calculateTotalStrain(
            this.getProbabilityStrain(probability),
            probability.skills[1].currentStrain,
        );
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ) {
        return (
            this.currentAimStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain() {
        return this.currentAimStrain;
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        if (this.withSliders) {
            current.aimStrainWithSliders = this.currentAimStrain;
        } else {
            current.aimStrainWithoutSliders = this.currentAimStrain;
        }
    }
}
