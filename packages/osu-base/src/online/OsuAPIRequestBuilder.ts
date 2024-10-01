import { APIRequestBuilder } from "./APIRequestBuilder";

/**
 * Available endpoints for osu! API.
 */
export type OsuAPIEndpoint =
    | "get_beatmaps"
    | "get_user"
    | "get_scores"
    | "get_user_best"
    | "get_user_recent"
    | "get_match"
    | "get_replay";

/**
 * An API request builder for osu!standard.
 */
export class OsuAPIRequestBuilder extends APIRequestBuilder<OsuAPIEndpoint> {
    protected override readonly host = "https://osu.ppy.sh/api/";
    protected override readonly APIkey = process.env.OSU_API_KEY!;
    protected override readonly APIkeyParam = `k=${this.APIkey}&`;
}
