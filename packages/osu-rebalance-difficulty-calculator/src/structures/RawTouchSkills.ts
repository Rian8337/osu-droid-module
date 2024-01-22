import { RawTouchAim } from "../skills/droid/RawTouchAim";
import { RawTouchSkill } from "../skills/droid/RawTouchSkill";
import { RawTouchTap } from "../skills/droid/RawTouchTap";

export interface RawTouchSkills extends Record<string, RawTouchSkill> {
    aimWithSliders: RawTouchAim;
    aimWithoutSliders: RawTouchAim;
    tapWithCheesability: RawTouchTap;
    tapWithoutCheesability: RawTouchTap;
}
