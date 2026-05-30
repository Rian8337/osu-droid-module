import { MathUtils } from "../math/MathUtils";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";

import { BooleanModSetting } from "./settings/BooleanModSetting";
import { IntegerModSetting } from "./settings/IntegerModSetting";

/**
 * Represents the Muted mod.
 */
export class ModMuted
    extends Mod
    implements IModApplicableToDroid, IModApplicableToOsu
{
    override readonly name = "Muted";
    override readonly acronym = "MU";

    readonly droidRanked = false;
    readonly isDroidRelevant = true;
    readonly droidScoreMultiplier = 1;
    readonly migrationDroidScoreMultiplier = 1;

    readonly osuRanked = true;
    readonly isOsuRelevant = true;
    readonly osuScoreMultiplier = 1;

    /**
     * Increase volume as combo builds.
     */
    readonly inverseMuting = new BooleanModSetting(
        "Start muted",
        "inverseMuting",
        "Increase volume as combo builds.",
        false,
    );

    /**
     * Add a metronome beat to help the player keep track of the rhythm.
     */
    readonly enableMetronome = new BooleanModSetting(
        "Enable metronome",
        "enableMetronome",
        "Add a metronome beat to help you keep track of the rhythm.",
        true,
    );

    /**
     * The combo count at which point the track reaches its final volume.
     */
    readonly muteComboCount = new IntegerModSetting(
        "Final volume at combo",
        "muteComboCount",
        "The combo count at which point the track reaches its final volume.",
        100,
        0,
        500,
    );

    /**
     * Hit sounds are also muted alongside the track.
     */
    readonly affectsHitSounds = new BooleanModSetting(
        "Mute hit sounds",
        "affectsHitSounds",
        "Hit sounds are also muted alongside the track.",
        true,
    );

    constructor() {
        super();

        this.inverseMuting.bindValueChanged((value) => {
            this.muteComboCount.min = value.newValue ? 1 : 0;
        }, true);
    }

    /**
     * Obtains the volume at a given combo.
     *
     * @param combo The combo.
     * @return The volume at `combo`, where 0 is muted and 1 is full volume.
     */
    volumeAt(combo: number): number {
        const volume = MathUtils.clamp(
            combo / Math.max(1, this.muteComboCount.value),
            0,
            1,
        );

        return this.inverseMuting.value ? volume : 1 - volume;
    }
}
