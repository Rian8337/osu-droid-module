import { RawTouchAim } from "../skills/droid/RawTouchAim";
import { RawTouchSkill } from "../skills/droid/RawTouchSkill";
import { RawTouchTap } from "../skills/droid/RawTouchTap";

export interface RawTouchSkills extends Record<string, RawTouchSkill> {
    readonly aimWithSliders: RawTouchAim;
    readonly aimWithoutSliders: RawTouchAim;
    readonly tapWithCheesability: RawTouchTap;
    readonly tapWithoutCheesability: RawTouchTap;
}
