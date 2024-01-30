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
            this.skills = [];

            for (const skill of skillsOrCopy.skills) {
                this.skills.push(skill.clone());
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
