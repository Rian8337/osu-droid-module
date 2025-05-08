import { ModSetting } from "./ModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to a boolean value.
 */
export class BooleanModSetting extends ModSetting<boolean> {
    override readonly displayFormatter: (value: boolean) => string = (v) =>
        v ? "Enabled" : "Disabled";
}
