import { ModSetting } from "./ModSetting";

/**
 * Represents a `Mod` specific setting that is constrained to one of a fixed set of enum-like values.
 *
 * Values are serialized by their index within {@link entries} to match the format used by osu!droid's
 * `EnumModSetting`.
 */
export class EnumModSetting<T> extends ModSetting<T> {
    protected override readonly displayFormatter: (value: T) => string;

    /**
     * The possible values of this `EnumModSetting`, in the order used for serialization.
     */
    readonly entries: readonly T[];

    constructor(
        name: string,
        key: string | null,
        description: string,
        defaultValue: T,
        entries: readonly T[],
        displayFormatter?: (value: T) => string,
    ) {
        super(name, key, description, defaultValue);

        this.entries = entries;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.displayFormatter = displayFormatter ?? ((v) => `${v}`);
    }

    override load(settings: Record<string, unknown>): void {
        if (this.key === null) {
            return;
        }

        const stored = settings[this.key];

        if (typeof stored === "number" && this.entries[stored] !== undefined) {
            this.value = this.entries[stored];
        }
    }

    override save(settings: Record<string, unknown>): void {
        if (this.key !== null) {
            settings[this.key] = this.entries.indexOf(this.value);
        }
    }
}
