import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { ModTimeRamp } from "./ModTimeRamp";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents the Wind Up mod.
 */
export class ModWindUp
    extends ModTimeRamp
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Wind Up";
    override readonly acronym = "WU";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;

    readonly osuRanked = false;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    override get droidScoreMultiplier(): number {
        return super.droidScoreMultiplier;
    }

    override readonly initialRate = new DecimalModSetting(
        "Initial rate",
        "The starting speed of the track.",
        1,
        0.5,
        1.99,
        0.01,
        2,
    );

    override readonly finalRate = new DecimalModSetting(
        "Final rate",
        "The final speed to ramp to.",
        1.5,
        0.51,
        2,
        0.01,
        2,
    );

    constructor() {
        super();

        this.initialRate.bindValueChanged((value) => {
            if (value.newValue >= this.finalRate.value) {
                this.finalRate.value = value.newValue + this.finalRate.step;
            }
        });

        this.finalRate.bindValueChanged((value) => {
            if (value.newValue <= this.initialRate.value) {
                this.initialRate.value = value.newValue - this.initialRate.step;
            }
        });
    }
}
