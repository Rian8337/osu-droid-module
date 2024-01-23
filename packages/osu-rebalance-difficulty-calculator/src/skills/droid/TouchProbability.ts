import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { Mod } from "@rian8337/osu-base";
import { RawTouchAim } from "./RawTouchAim";
import { RawTouchTap } from "./RawTouchTap";
import { RawTouchSkills } from "../../structures/RawTouchSkills";

export class TouchProbability {
    probability = 1;
    readonly skills: RawTouchSkills;

    constructor(copy: TouchProbability);
    constructor(
        mods: Mod[],
        clockRate: number,
        greatWindow: number,
        firstObject: DroidDifficultyHitObject,
        isForceAR: boolean,
    );
    constructor(
        modsOrCopy: Mod[] | TouchProbability,
        clockRate?: number,
        greatWindow?: number,
        firstObject?: DroidDifficultyHitObject,
        isForceAR?: boolean,
    ) {
        if (modsOrCopy instanceof TouchProbability) {
            this.skills = {
                aimWithSliders: new RawTouchAim(
                    modsOrCopy.skills.aimWithSliders,
                ),
                aimWithoutSliders: new RawTouchAim(
                    modsOrCopy.skills.aimWithoutSliders,
                ),
                tapWithCheesability: new RawTouchTap(
                    modsOrCopy.skills.tapWithCheesability,
                ),
                tapWithoutCheesability: new RawTouchTap(
                    modsOrCopy.skills.tapWithoutCheesability,
                ),
            };

            return;
        }

        // These are safe to non-null (see constructor overloads).
        this.skills = {
            aimWithSliders: new RawTouchAim(
                modsOrCopy,
                clockRate!,
                firstObject!,
                isForceAR!,
                true,
            ),
            aimWithoutSliders: new RawTouchAim(
                modsOrCopy,
                clockRate!,
                firstObject!,
                isForceAR!,
                false,
            ),
            tapWithCheesability: new RawTouchTap(
                modsOrCopy,
                clockRate!,
                firstObject!,
                isForceAR!,
                greatWindow!,
                true,
            ),
            tapWithoutCheesability: new RawTouchTap(
                modsOrCopy,
                clockRate!,
                firstObject!,
                isForceAR!,
                greatWindow!,
                false,
            ),
        };
    }

    process(current: DroidDifficultyHitObject, currentHand: TouchHand) {
        for (const skill of Object.values(this.skills)) {
            skill.process(current, currentHand);
        }
    }
}
