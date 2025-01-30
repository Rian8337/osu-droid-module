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
    private static apiKey = "";

    /**
     * Sets the API key for all subsequent initializations of an `OsuAPIRequestBuilder`.
     *
     * @param key The API key.
     */
    static setAPIKey(key: string) {
        this.apiKey = key;
    }

    protected override readonly host = "https://osu.ppy.sh/api/";
    protected override readonly APIkey = OsuAPIRequestBuilder.apiKey;
    protected override readonly APIkeyParam = `k=${this.APIkey}&`;
}
