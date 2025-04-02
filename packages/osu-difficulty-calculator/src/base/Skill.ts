import { Mod } from "@rian8337/osu-base";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";

/**
 * A bare minimal abstract skill for fully custom skill implementations.
 *
 * This class should be considered a "processing" class and not persisted.
 */
export abstract class Skill {
    /**
     * The mods that this skill processes.
     */
    protected readonly mods: readonly Mod[];

    constructor(mods: readonly Mod[]) {
        this.mods = mods;
    }

    /**
     * Processes a hitobject.
     *
     * @param current The hitobject to process.
     */
    abstract process(current: DifficultyHitObject): void;

    /**
     * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
     */
    abstract difficultyValue(): number;
}
