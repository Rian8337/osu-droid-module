import { MathUtils } from "../math/MathUtils";
import { IModApplicableToDroid } from "./IModApplicableToDroid";
import { IModApplicableToOsu } from "./IModApplicableToOsu";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";
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

    /**
     * Increase volume as combo builds.
     */
    readonly inverseMuting = new BooleanModSetting(
        "Start muted",
        "Increase volume as combo builds.",
        false,
    );

    /**
     * Add a metronome beat to help the player keep track of the rhythm.
     */
    readonly enableMetronome = new BooleanModSetting(
        "Enable metronome",
        "Add a metronome beat to help you keep track of the rhythm.",
        true,
    );

    /**
     * The combo count at which point the track reaches its final volume.
     */
    readonly muteComboCount = new IntegerModSetting(
        "Final volume at combo",
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
        "Hit sounds are also muted alongside the track.",
        true,
    );

    get droidRanked(): boolean {
        return false;
    }

    get isDroidRelevant(): boolean {
        return true;
    }

    calculateDroidScoreMultiplier(): number {
        return 1;
    }

    get osuRanked(): boolean {
        return true;
    }

    get isOsuRelevant(): boolean {
        return true;
    }

    get osuScoreMultiplier(): number {
        return 1;
    }

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

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        const { settings } = mod;

        this.inverseMuting.value =
            (settings?.inverseMuting as boolean | undefined) ??
            this.inverseMuting.value;

        this.enableMetronome.value =
            (settings?.enableMetronome as boolean | undefined) ??
            this.enableMetronome.value;

        this.muteComboCount.value =
            (settings?.muteComboCount as number | undefined) ??
            this.muteComboCount.value;

        this.affectsHitSounds.value =
            (settings?.affectsHitSounds as boolean | undefined) ??
            this.affectsHitSounds.value;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return {
            inverseMuting: this.inverseMuting.value,
            enableMetronome: this.enableMetronome.value,
            muteComboCount: this.muteComboCount.value,
            affectsHitSounds: this.affectsHitSounds.value,
        };
    }
}
