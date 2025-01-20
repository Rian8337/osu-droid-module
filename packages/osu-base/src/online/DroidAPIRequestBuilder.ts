import { APIRequestBuilder } from "./APIRequestBuilder";

/**
 * Available endpoints for osu!droid API.
 */
export type DroidAPIEndpoint =
    | "getuserinfo.php"
    | "scoresearch.php"
    | "scoresearchv2.php"
    | "upload"
    | "bestpp"
    | "user_list.php"
    | "usergeneral.php"
    | "top.php"
    | "time.php"
    | "account_ban_get.php"
    | "account_ban_set.php"
    | "account_restricted_get.php"
    | "account_restricted_set.php"
    | "single_score_wipe.php"
    | "user_wipe.php"
    | "user_rename.php";

/**
 * An API request builder for osu!droid.
 */
export class DroidAPIRequestBuilder extends APIRequestBuilder<DroidAPIEndpoint> {
    protected override readonly host = "https://osudroid.moe/api/";
    protected override readonly APIkey = process.env.DROID_API_KEY!;
    protected override readonly APIkeyParam = `apiKey=${this.APIkey}&`;

    override buildURL(): string {
        switch (this.endpoint) {
            case "upload":
            case "bestpp": {
                let url = this.baseURL + "/";

                for (const [, value] of this.params.entries()) {
                    url += encodeURIComponent(value);
                }

                return url;
            }

            default:
                return super.buildURL();
        }
    }
}
