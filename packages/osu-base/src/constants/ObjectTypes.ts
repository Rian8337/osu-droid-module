/**
 * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
 */
export enum ObjectTypes {
    circle = 1 << 0,
    slider = 1 << 1,
    newCombo = 1 << 2,
    spinner = 1 << 3,
    comboOffset = (1 << 4) | (1 << 5) | (1 << 6),
}
