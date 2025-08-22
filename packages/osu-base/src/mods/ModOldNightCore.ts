import { ModNightCore } from "./ModNightCore";

/**
 * Represents the "old" `ModNightCore`.
 *
 * This `Mod` is used solely for difficulty calculation of replays with version 3 or older. The reason behind this is a
 * bug that was patched in replay version 4, where all audio that did not have 44100Hz frequency would slow down or
 * speed up depending on the frequency of the audio.
 *
 * The equation for the playback rate with respect to the audio frequency (in Hz) was:
 *
 * ```
 * playback_rate = 44100 * 1.5 / audio_frequency
 * ```
 *
 * For example, if the audio's frequency is 48000Hz, the audio would play at `44100 * 1.5 / 48000 = 1.378125` playback
 * rate.
 *
 * This `Mod` assumes that the audio frequency is 48000Hz and applies the same equation to calculate the playback rate.
 * The frequency was chosen after sampling many audio files that were affected by this bug, and it seemed that 48000Hz
 * was the most common frequency used in those files.
 *
 * Realistically, it is possible to obtain the audio frequency in the game during gameplay loading (and therefore would
 * result in the correct playback rate), but this would require additional work and the current solution is deemed
 * sufficient for the purpose it serves.
 */
export class ModOldNightCore extends ModNightCore {
    constructor() {
        super();

        this.trackRateMultiplier.value = (44.1 * 1.5) / 48;
    }

    override get droidScoreMultiplier(): number {
        return 1.12;
    }
}
