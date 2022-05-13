import { EditorGridSize } from "../../constants/EditorGridSize";

/**
 * Contains saved settings for the beatmap editor.
 */
export class BeatmapEditor {
    /**
     * Time in milliseconds of bookmarks.
     */
    bookmarks: number[] = [];

    /**
     * The multiplier at which distance between consecutive notes will be snapped based on their rhythmical difference.
     */
    distanceSnap: number = 1;

    /**
     * Determines the editor's behaviour in quantizing hit objects based on the {@link https://osu.ppy.sh/wiki/en/Client/Beatmap_editor/Beat_Snap Beat Snap} principles.
     */
    beatDivisor: number = 4;

    /**
     * The grid size setting in the editor.
     */
    gridSize: EditorGridSize = EditorGridSize.small;

    /**
     * The scale factor for the {@link https://osu.ppy.sh/wiki/en/Client/Beatmap_editor/Compose#top-left-(hit-objects-timeline) object timeline}.
     */
    timelineZoom: number = 1;
}
