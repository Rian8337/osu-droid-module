import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModTimeRamp } from "./ModTimeRamp";

/**
 * Represents the Wind Down mod.
 */
export class ModWindDown
    extends ModTimeRamp
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Wind Down";
    override readonly acronym = "WD";

    private _initialRate = 1;

    override get initialRate(): number {
        return this._initialRate;
    }

    override set initialRate(value: number) {
        this._initialRate = value;

        if (value <= this.finalRate) {
            this.finalRate = value - 0.01;
        }
    }

    private _finalRate = 0.75;

    override get finalRate(): number {
        return this._finalRate;
    }

    override set finalRate(value: number) {
        this._finalRate = value;

        if (value >= this.initialRate) {
            this.initialRate = value + 0.01;
        }
    }

    readonly droidRanked = false;
    readonly osuRanked = false;

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }
}
