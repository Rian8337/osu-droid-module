/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

/**
 * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
 */
export enum ObjectTypes {
    Circle = 1 << 0,
    Slider = 1 << 1,
    NewCombo = 1 << 2,
    Spinner = 1 << 3,
    ComboOffset = (1 << 4) | (1 << 5) | (1 << 6),
}
