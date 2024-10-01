import { BeatmapCountdown } from "../../constants/BeatmapCountdown";
import { BeatmapOverlayPosition } from "../../constants/BeatmapOverlayPosition";
import { SampleBank } from "../../constants/SampleBank";
import { GameMode } from "../../constants/GameMode";

/**
 * Contains general information about a beatmap.
 */
export class BeatmapGeneral {
    /**
     * The location of the audio file relative to the beatmapset file.
     */
    audioFilename = "";

    /**
     * The amount of milliseconds of silence before the audio starts playing.
     */
    audioLeadIn = 0;

    /**
     * The time in milliseconds when the audio preview should start.
     *
     * If -1, the audio should begin playing at 40% of its length.
     */
    previewTime = -1;

    /**
     * The speed of the countdown before the first hit object.
     */
    countdown = BeatmapCountdown.normal;

    /**
     * The sample bank that will be used if timing points do not override it.
     */
    sampleBank = SampleBank.normal;

    /**
     * The sample volume that will be used if timing points do not override it.
     */
    sampleVolume = 100;

    /**
     * The multiplier for the threshold in time where hit objects
     * placed close together stack, ranging from 0 to 1.
     */
    stackLeniency = 0.7;

    /**
     * The game mode of the beatmap.
     */
    mode = GameMode.osu;

    /**
     * Whether or not breaks have a letterboxing effect.
     */
    letterBoxInBreaks = false;

    /**
     * Whether or not the storyboard can use the user's skin images.
     */
    useSkinSprites = false;

    /**
     * The draw order of hit circle overlays compared to hit numbers.
     */
    overlayPosition = BeatmapOverlayPosition.noChange;

    /**
     * The preffered skin to use during gameplay.
     */
    skinPreference = "";

    /**
     * Whether or not a warning about flashing colours should be shown at the beginning of the map.
     */
    epilepsyWarning = false;

    /**
     * The time in beats that the countdown starts before the first hit object.
     */
    countdownOffset = 0;

    /**
     * Whether or not the storyboard allows widescreen viewing.
     */
    widescreenStoryboard = false;

    /**
     * Whether or not sound samples will change rate when playing with speed-changing mods.
     */
    samplesMatchPlaybackRate = true;
}
