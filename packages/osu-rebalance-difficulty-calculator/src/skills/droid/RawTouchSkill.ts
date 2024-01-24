import { HitObject, Mod } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";

export abstract class RawTouchSkill {
    protected abstract readonly strainDecayBase: number;

    private readonly mods: Mod[];
    private readonly clockRate: number;
    private readonly isForceAR: boolean;

    private readonly lastObjects: [HitObject[], HitObject[]] = [[], []];
    protected readonly maxObjectsHistory = 2;

    private readonly lastDifficultyObjects: [
        DroidDifficultyHitObject[],
        DroidDifficultyHitObject[],
    ] = [[], []];
    protected readonly maxDifficultyObjectsHistory = 3;

    private lastHand: TouchHand.left | TouchHand.right;
    private _currentStrain = 0;

    get currentStrain() {
        return this._currentStrain;
    }

    constructor(copy: RawTouchSkill);
    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
        isForceAR: boolean,
    );
    constructor(
        modsOrCopy: Mod[] | RawTouchSkill,
        clockRate?: number,
        firstObject?: DroidDifficultyHitObject,
        isForceAR?: boolean,
    ) {
        if (modsOrCopy instanceof RawTouchSkill) {
            this.mods = modsOrCopy.mods.slice();
            this.clockRate = modsOrCopy.clockRate;
            this.isForceAR = modsOrCopy.isForceAR;

            this._currentStrain = modsOrCopy._currentStrain;
            this.lastHand = modsOrCopy.lastHand;

            for (let i = 0; i < this.lastObjects.length; ++i) {
                this.lastObjects[i] = modsOrCopy.lastObjects[i].slice();
            }

            return;
        }

        this.mods = modsOrCopy;

        // These are safe to non-null (see constructor overloads).
        this.clockRate = clockRate!;
        this.isForceAR = isForceAR!;

        // Automatically assume the first note of a beatmap is hit with the left hand and the second note is hit with the right.
        this.lastObjects[TouchHand.left].push(firstObject!.previous(0)!.object);
        this.lastObjects[TouchHand.right].push(firstObject!.object);
        this.lastHand = TouchHand.right;
    }

    process(current: DroidDifficultyHitObject, currentHand: TouchHand) {
        this.updateStrainValue(current, currentHand);
        this.updateHistory(current, currentHand);
    }

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
        const lastObjects = this.lastObjects[currentHand];
        const lastLast = lastObjects.length > 1 ? lastObjects.at(-2) : null;
        const last = lastObjects.length > 0 ? lastObjects.at(-1) : null;

        const difficultyObject = new DroidDifficultyHitObject(
            current.object,
            last ?? null,
            lastLast ?? null,
            this.lastDifficultyObjects[currentHand],
            this.clockRate,
            current.timePreempt,
            this.isForceAR,
        );

        difficultyObject.computeProperties(this.clockRate, lastObjects);

        return difficultyObject;
    }

    protected getSimulatedSwapObject(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
    ) {
        const last = this.lastObjects[this.otherHand(currentHand)].at(-1);
        const lastLast = this.lastObjects[currentHand].at(-1);

        const difficultyObject = new DroidDifficultyHitObject(
            current.object,
            last ?? null,
            lastLast ?? null,
            this.lastDifficultyObjects[currentHand],
            this.clockRate,
            current.timePreempt,
            this.isForceAR,
        );

        difficultyObject.computeProperties(
            this.clockRate,
            this.lastObjects[currentHand],
        );

        return difficultyObject;
    }

    private getRelevantHand(currentHand: TouchHand) {
        return currentHand === TouchHand.drag ? this.lastHand : currentHand;
    }

    private otherHand(currentHand: TouchHand.left): TouchHand.right;
    private otherHand(currentHand: TouchHand.right): TouchHand.left;
    private otherHand(currentHand: TouchHand): TouchHand.left | TouchHand.right;
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

    private updateStrainValue(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand,
    ) {
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
    }

    private updateHistory(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand,
    ) {
        const relevantHand = this.getRelevantHand(currentHand);

        this.lastObjects[relevantHand].push(current.object);
        this.lastDifficultyObjects[relevantHand].push(
            currentHand === TouchHand.drag
                ? current
                : this.getSimulatedObject(current, currentHand),
        );

        while (this.lastObjects[relevantHand].length > this.maxObjectsHistory) {
            this.lastObjects[relevantHand].shift();
        }

        while (
            this.lastDifficultyObjects[relevantHand].length >
            this.maxDifficultyObjectsHistory
        ) {
            this.lastDifficultyObjects[relevantHand].shift();
        }

        this.lastHand = relevantHand;
    }

    private strainDecay(ms: number) {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}
