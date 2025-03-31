/**
 * Represents a mod that has been serialized.
 */
export interface SerializedMod {
    /**
     * The acronym of the mod.
     */
    readonly acronym: string;

    /**
     * Settings specific to the mod, if any.
     */
    readonly settings?: Record<string, unknown>;
}
