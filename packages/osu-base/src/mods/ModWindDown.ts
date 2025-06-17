import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModTimeRamp } from "./ModTimeRamp";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Wind Down mod.
 */
export class ModWindDown
    extends ModTimeRamp
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Wind Down";
    override readonly acronym = "WD";

    readonly droidRanked = false;
    readonly osuRanked = false;

    override readonly initialRate = new DecimalModSetting(
        "Initial rate",
        "The starting speed of the track.",
        1,
        0.51,
        2,
        0.01,
        2,
    );

    override readonly finalRate = new DecimalModSetting(
        "Final rate",
        "The final speed to ramp to.",
        0.75,
        0.5,
        1.99,
        0.01,
        2,
    );

    constructor() {
        super();

        this.initialRate.bindValueChanged((value) => {
            if (value.newValue <= this.finalRate.value) {
                this.finalRate.value = value.newValue - this.finalRate.step;
            }
        });

        this.finalRate.bindValueChanged((value) => {
            if (value.newValue >= this.initialRate.value) {
                this.initialRate.value = value.newValue + this.initialRate.step;
            }
        });
    }

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
