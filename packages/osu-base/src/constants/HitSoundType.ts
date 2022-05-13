/**
 * Represents available hitsound types.
 */
export enum HitSoundType {
    none = 0,
    normal = 1 << 0,
    whistle = 1 << 1,
    finish = 1 << 2,
    clap = 1 << 3,
}
