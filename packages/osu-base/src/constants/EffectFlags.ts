/**
 * Effects that can occur in an effect control point.
 */
export enum EffectFlags {
    none = 0,
    kiai = 1 << 0,
    omitFirstBarLine = 1 << 3,
}
