import { Mod } from "./Mod";
import { ModTraceable } from "./ModTraceable";
import { SerializedMod } from "./SerializedMod";
import { DecimalModSetting } from "./settings/DecimalModSetting";

/**
 * Represents a `Mod` that adjusts the size of `HitObject`s during their fade in animation.
 */
export abstract class ModObjectScaleTween extends Mod {
    /**
     * The initial size multiplier applied to all `HitObject`s.
     */
    abstract readonly startScale: DecimalModSetting;

    /**
     * The final size multiplier applied to all [HitObject]s.
     */
    endScale = 1;

    constructor() {
        super();

        this.incompatibleMods.add(ModObjectScaleTween).add(ModTraceable);
    }

    override copySettings(mod: SerializedMod): void {
        super.copySettings(mod);

        const { settings } = mod;

        this.startScale.value =
            (settings?.startScale as number | undefined) ??
            this.startScale.value;
    }

    protected override serializeSettings(): Record<string, unknown> | null {
        return { startScale: this.startScale.value };
    }
}
