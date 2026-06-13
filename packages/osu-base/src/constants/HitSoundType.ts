/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

/**
 * Represents available hitsound types.
 */
export enum HitSoundType {
    None = 0,
    Normal = 1 << 0,
    Whistle = 1 << 1,
    Finish = 1 << 2,
    Clap = 1 << 3,
}
