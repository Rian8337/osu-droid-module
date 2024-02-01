import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";

export class TouchProbability {
    probability = 1;
    readonly skills: RawTouchSkill[];

    constructor(copy: TouchProbability);
    constructor(skills: RawTouchSkill[]);
    constructor(skillsOrCopy: RawTouchSkill[] | TouchProbability) {
        if (skillsOrCopy instanceof TouchProbability) {
            this.probability = skillsOrCopy.probability;
            this.skills = new Array(skillsOrCopy.skills.length);

            for (let i = 0; i < skillsOrCopy.skills.length; ++i) {
                this.skills[i] = skillsOrCopy.skills[i].clone();
            }

            return;
        }

        this.skills = skillsOrCopy;
    }

    process(current: DroidDifficultyHitObject, currentHand: TouchHand) {
        for (const skill of this.skills) {
            skill.process(current, currentHand);
        }
    }
}
