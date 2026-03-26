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

    private _objectDifficulties: number[] = [];

    /**
     * The difficulties of {@link DifficultyHitObject}s, populated by {@link Skill.process}.
     */
    protected get objectDifficulties(): readonly number[] {
        return this._objectDifficulties;
    }

    constructor(mods: ModMap) {
        this.mods = mods;
    }

    /**
     * Calculates the strain value of a hitobject and stores the value in it.
     * This value is affected by previously processed objects.
     *
     * @param current The hitobject to process.
     */
    process(current: DifficultyHitObject): void {
        const difficultyValue = this.processInternal(current);

        this.saveToHitObject(current, difficultyValue);
        this._objectDifficulties.push(difficultyValue);
    }

    /**
     * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
     */
    abstract difficultyValue(): number;

    /**
     * Saves the calculated difficulty to a {@link DifficultyHitObject}.
     *
     * @param current The {@link DifficultyHitObject} to save the difficulty to.
     * @param difficulty The difficulty to save.
     */
    protected saveToHitObject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        current: DifficultyHitObject,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        difficulty: number,
    ) {
        // Do nothing by default.
    }

    /**
     * Calculates the difficulty value of a hitobject and stores the value in it.
     *
     * @param current The hitobject to process.
     */
    protected abstract processInternal(current: DifficultyHitObject): number;
}
