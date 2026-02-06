import { ModUtil } from "../utils/ModUtil";
import { Mod } from "./Mod";
import { SerializedMod } from "./SerializedMod";

/**
 * A map that stores `Mod`s depending on their type.
 *
 * This also has additional utilities to eliminate unnecessary `Mod`s.
 */
export class ModMap extends Map<typeof Mod, Mod> {
    /**
     * Whether this map is empty.
     */
    get isEmpty(): boolean {
        return this.size === 0;
    }

    constructor(iterable?: readonly (readonly [typeof Mod, Mod])[] | null) {
        // We are not passing `iterable` here to preserve mod-specific settings.
        super();

        if (Array.isArray(iterable)) {
            for (const [key, value] of iterable as [typeof Mod, Mod][]) {
                // Ensure the mod type corresponds to the mod instance.
                if (key !== value.constructor) {
                    throw new TypeError(
                        `Key ${key.name} does not match value ${value.constructor.name}`,
                    );
                }

                this.set(value);
            }
        }
    }

    /**
     * Checks if the given `Mod` is present in this map.
     *
     * @param value The `Mod` to check for.
     * @returns Whether the `Mod` is present in this map.
     */
    override has(value: Mod): boolean;

    /**
     * Checks if the given `Mod` type is present in this map.
     *
     * @param key The `Mod` type to check for.
     * @returns Whether the `Mod` type is present in this map.
     */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    override has(key: typeof Mod): boolean;

    override has(keyOrValue: typeof Mod | Mod): boolean {
        const key =
            keyOrValue instanceof Mod
                ? (keyOrValue.constructor as typeof Mod)
                : keyOrValue;

        return super.has(key);
    }

    override get<T extends Mod>(key: new () => T): T | undefined {
        return super.get(key) as T | undefined;
    }

    /**
     * Inserts a new instance of the given `Mod` type into this map.
     *
     * Do note that this method will remove any `Mod`s that are incompatible with the specified `Mod`.
     *
     * @param key The `Mod` type to insert.
     * @returns The existing `Mod` instance of the given `Mod` type if it was already present, or `null` if it was not.
     */
    override set<T extends Mod>(key: new () => T): T | null;

    /**
     * Inserts the given `Mod` into this map.
     *
     * Do note that this method will remove any `Mod`s that are incompatible with the specified `Mod`.
     *
     * @param value The `Mod` to insert.
     * @returns The existing `Mod` instance if it was already present, or `null` if it was not.
     */
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    override set<T extends Mod>(value: T): T | null;

    override set<T extends Mod>(keyOrValue: (new () => T) | T): T | null {
        const key = (
            keyOrValue instanceof Mod ? keyOrValue.constructor : keyOrValue
        ) as new () => T;

        const value = keyOrValue instanceof Mod ? keyOrValue : new key();

        // Ensure the mod type corresponds to the mod instance.
        if (key !== value.constructor) {
            throw new TypeError(
                `Key ${key.name} does not match value ${value.constructor.name}`,
            );
        }

        const existing = this.get(key);

        // Check if there are any mods that are incompatible with the new mod.
        // If so, remove them.
        for (const mod of this.values()) {
            if (!value.isCompatibleWith(mod)) {
                this.delete(mod.constructor as typeof Mod);
            }
        }

        super.set(key, value);

        return existing ?? null;
    }

    /**
     * Serializes all `Mod`s that are in this map.
     *
     * @param includeNonUserPlayable Whether to include non-user-playable mods. Defaults to `true`.
     */
    serializeMods(includeNonUserPlayable = true): SerializedMod[] {
        return ModUtil.serializeMods(this.values(), includeNonUserPlayable);
    }

    /**
     * Determines whether this `ModMap` is equal to another `ModMap`.
     *
     * This equality check succeeds if and only if the two `ModMap`s have the same size and
     * all `Mod`s in this `ModMap` are equal to the corresponding `Mod`s in the other `ModMap`.
     *
     * @param other The other `ModMap` to compare to.
     * @returns Whether the two `ModMap`s are equal.
     */
    equals(other: ModMap): boolean {
        if (this.size !== other.size) {
            return false;
        }

        for (const [key, value] of this) {
            const otherValue = other.get(key as new () => Mod);

            if (!otherValue?.equals(value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns a string representation of this `ModMap`.
     *
     * @param includeNonUserPlayable Whether to include non-user-playable mods. Defaults to `true`.
     * @returns A string representation of this `ModMap`.
     */
    override toString(includeNonUserPlayable = true): string {
        return ModUtil.modsToOrderedString(this, includeNonUserPlayable);
    }
}
