import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { Mod } from "@rian8337/osu-base";
import { RawTouchAim } from "./RawTouchAim";
import { RawTouchTap } from "./RawTouchTap";
import { RawTouchSkills } from "../../structures/RawTouchSkills";

export class TouchProbability {
    probability = 1;
    readonly skills: RawTouchSkills;

    private readonly mods: Mod[];
    private readonly clockRate: number;
    private readonly greatWindow: number;
    private readonly firstObject: DroidDifficultyHitObject;

    constructor(
        mods: Mod[],
        clockRate: number,
        greatWindow: number,
        firstObject: DroidDifficultyHitObject,
    ) {
        this.mods = mods;
        this.clockRate = clockRate;
        this.greatWindow = greatWindow;
        this.firstObject = firstObject;

        this.skills = {
            aimWithSliders: new RawTouchAim(mods, clockRate, firstObject, true),
            aimWithoutSliders: new RawTouchAim(
                mods,
                clockRate,
                firstObject,
                false,
            ),
            tapWithCheesability: new RawTouchTap(
                mods,
                clockRate,
                firstObject,
                greatWindow,
                true,
            ),
            tapWithoutCheesability: new RawTouchTap(
                mods,
                clockRate,
                firstObject,
                greatWindow,
                false,
            ),
        };
    }

    process(current: DroidDifficultyHitObject, currentHand: TouchHand) {
        for (const skill of Object.values(this.skills)) {
            skill.process(current, currentHand);
        }
    }

    clone() {
        const probability = new TouchProbability(
            this.mods,
            this.clockRate,
            this.greatWindow,
            this.firstObject,
        );

        probability.probability = this.probability;
        probability.skills.aimWithSliders = this.skills.aimWithSliders.clone();
        probability.skills.aimWithoutSliders =
            this.skills.aimWithoutSliders.clone();
        probability.skills.tapWithCheesability =
            this.skills.tapWithCheesability.clone();
        probability.skills.tapWithoutCheesability =
            this.skills.tapWithoutCheesability.clone();

        return probability;
    }
}
