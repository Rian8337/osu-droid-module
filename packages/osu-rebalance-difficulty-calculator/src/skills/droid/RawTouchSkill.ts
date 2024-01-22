import { HitObject, Mod, Modes } from "@rian8337/osu-base";
import { DifficultyHitObjectCreator } from "../../preprocessing/DifficultyHitObjectCreator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";

export abstract class RawTouchSkill {
    protected abstract readonly strainDecayBase: number;

    protected readonly mods: Mod[];
    protected readonly clockRate: number;
    protected readonly firstObject: DroidDifficultyHitObject;

    protected readonly lastObjects: [HitObject[], HitObject[]] = [[], []];
    private readonly maxObjectsHistory = 3;

    private _currentStrain = 0;
    private lastHand = TouchHand.right as TouchHand.left | TouchHand.right;

    get currentStrain() {
        return this._currentStrain;
    }

    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
    ) {
        this.mods = mods;
        this.clockRate = clockRate;
        this.firstObject = firstObject;

        // Automatically assume the first note of a beatmap is hit with the left hand and the second note is hit with the right.
        this.lastObjects[TouchHand.left].push(firstObject.previous(0)!.object);
        this.lastObjects[TouchHand.right].push(firstObject.object);
    }

    process(current: DroidDifficultyHitObject, currentHand: TouchHand) {
        this._currentStrain *= this.strainDecay(current.strainTime);

        if (currentHand === TouchHand.drag) {
            this._currentStrain += this.strainValueOf(current);
        } else {
            this._currentStrain += this.strainValueIf(
                current,
                currentHand,
                this.lastHand,
            );
        }

        const relevantHand = this.getRelevantHand(currentHand);

        this.lastObjects[relevantHand].push(current.object);

        while (this.lastObjects[relevantHand].length > this.maxObjectsHistory) {
            this.lastObjects[relevantHand].shift();
        }

        this.lastHand = relevantHand;
    }

    abstract clone(): RawTouchSkill;

    protected abstract strainValueOf(current: DroidDifficultyHitObject): number;

    protected abstract strainValueIf(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ): number;

    protected getSimulatedObject(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
    ) {
        // A simulated difficulty object is created for angle calculation.
        const objects: HitObject[] = [];
        const lastObjects = this.lastObjects[currentHand];
        const lastLast = lastObjects.length > 1 ? lastObjects.at(-2) : null;

        if (lastLast) {
            objects.push(lastLast);
        }

        objects.push(lastObjects.at(-1)!, current.object);

        return new DifficultyHitObjectCreator()
            .generateDifficultyObjects({
                objects: objects,
                mods: this.mods,
                mode: Modes.droid,
                speedMultiplier: this.clockRate,
            })
            .at(-1)!;
    }

    protected getSimulatedSwapObject(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
    ) {
        const last = this.lastObjects[this.otherHand(currentHand)].at(-1)!;
        const lastLast = this.lastObjects[currentHand].at(-1)!;

        return new DifficultyHitObjectCreator()
            .generateDifficultyObjects({
                objects: [lastLast, last, current.object],
                mods: this.mods,
                mode: Modes.droid,
                speedMultiplier: this.clockRate,
            })
            .at(-1)!;
    }

    protected getRelevantHand(currentHand: TouchHand) {
        return currentHand === TouchHand.drag ? this.lastHand : currentHand;
    }

    private otherHand(currentHand: TouchHand.left): TouchHand.right;
    private otherHand(currentHand: TouchHand.right): TouchHand.left;
    private otherHand(
        currentHand: TouchHand.drag,
    ): TouchHand.left | TouchHand.right;
    private otherHand(
        currentHand: TouchHand.left | TouchHand.right,
    ): TouchHand.left | TouchHand.right;
    private otherHand(currentHand: TouchHand) {
        switch (currentHand) {
            case TouchHand.left:
                return TouchHand.right;
            case TouchHand.right:
                return TouchHand.left;
            case TouchHand.drag:
                return this.otherHand(this.lastHand);
        }
    }

    private strainDecay(ms: number) {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}