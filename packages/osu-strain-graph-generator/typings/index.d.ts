declare module "@rian8337/osu-strain-graph-generator" {
    import { StarRating } from "@rian8337/osu-difficulty-calculator";
    import { StarRating as RebalanceStarRating } from "@rian8337/osu-rebalance-difficulty-calculator";

    //#region Functions

    /**
     * Generates the strain chart of beatmap beatmap and returns the chart as a buffer.
     *
     * @param beatmap The beatmap to generate the strain graph for.
     * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
     * @param color The color of the graph.
     */
    export default function getStrainChart(
        beatmap: StarRating | RebalanceStarRating,
        beatmapsetID?: number,
        color?: string
    ): Promise<Buffer | null>;

    //#endregion
}
