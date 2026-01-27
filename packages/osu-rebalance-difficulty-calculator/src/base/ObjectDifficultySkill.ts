import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Skill } from "./Skill";

/**
 * Processes the difficulty of {@link DifficultyHitObject}s and keeps track of their individual difficulties.
 */
export abstract class ObjectDifficultySkill
    extends Skill
    implements IHasPeakDifficulty
{
    private _objectDifficulties: number[] = [];

    /**
     * The difficulties of {@link DifficultyHitObject}s, populated by {@link Skill.process}.
     */
    protected get objectDifficulties(): readonly number[] {
        return this._objectDifficulties;
    }

    get peaks(): readonly number[] {
        return this._objectDifficulties;
    }

    override process(current: DifficultyHitObject): void {
        const difficulty = this.objectDifficultyOf(current);

        this._objectDifficulties.push(difficulty);
    }

    /**
     * Calculates the difficulty of a {@link DifficultyHitObject}.
     *
     * @param current The {@link DifficultyHitObject} to calculate the difficulty of.
     * @returns The difficulty of the {@link DifficultyHitObject}.
     */
    protected abstract objectDifficultyOf(current: DifficultyHitObject): number;
}
