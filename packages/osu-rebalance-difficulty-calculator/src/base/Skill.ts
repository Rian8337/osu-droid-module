import { ModMap } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";

/**
 * A bare minimal abstract skill for fully custom skill implementations.
 */
export abstract class Skill {
    /**
     * The mods that this skill processes.
     */
    protected readonly mods: ModMap;

    constructor(mods: ModMap) {
        this.mods = mods;
    }

    /**
     * Calculates the strain value of a hitobject and stores the value in it.
     * This value is affected by previously processed objects.
     *
     * @param current The hitobject to process.
     */
    abstract process(current: DifficultyHitObject): void;

    /**
     * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
     */
    abstract difficultyValue(): number;
}
