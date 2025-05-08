import { NumberModSetting } from "./NumberModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a range of integer values.
 */
export class IntegerModSetting extends NumberModSetting {
    constructor(
        name: string,
        description: string,
        defaultValue: number,
        min = -2147483648,
        max = 2147483647,
    ) {
        super(name, description, defaultValue, min, max, 1);
    }
}
