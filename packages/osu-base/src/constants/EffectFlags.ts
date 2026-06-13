/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

/**
 * Effects that can occur in an effect control point.
 */
export enum EffectFlags {
    None = 0,
    Kiai = 1 << 0,
    OmitFirstBarLine = 1 << 3,
}
