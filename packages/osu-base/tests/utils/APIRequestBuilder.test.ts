import { DroidAPIRequestBuilder, OsuAPIRequestBuilder } from "../../src";

const droidHostname = "https://osudroid.moe/api/";
const osuHostname = "https://osu.ppy.sh/api/";

process.env.DROID_API_KEY = "testkey";

describe("Test setting endpoint", () => {
    test("Not upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("getuserinfo.php");

        expect(builder.buildURL()).toBe(
            droidHostname +
                `getuserinfo.php?apiKey=${process.env.DROID_API_KEY}&`
        );
    });

    test("Upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("upload");

        expect(builder.buildURL()).toBe(droidHostname + "upload/");
    });
});

describe("Test adding parameter", () => {
    test("Not upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("getuserinfo.php").addParameter("uid", 51076);

        expect(builder.buildURL()).toBe(
            droidHostname +
                `getuserinfo.php?apiKey=${process.env.DROID_API_KEY}&uid=51076&`
        );
    });

    test("Upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("upload").addParameter("", 51076);

        expect(builder.buildURL()).toBe(droidHostname + "upload/51076");
    });
});

describe("Test setting API key requirement", () => {
    test("Not upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("getuserinfo.php").setRequireAPIkey(false);

        expect(builder.buildURL()).toBe(droidHostname + "getuserinfo.php?");
    });

    test("Upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder
            .setEndpoint("upload")
            .setRequireAPIkey(true)
            .addParameter("", 51076);

        expect(builder.buildURL()).toBe(droidHostname + "upload/51076");
    });
});

test("Test removing parameter", () => {
    const builder = new DroidAPIRequestBuilder();

    builder
        .setEndpoint("getuserinfo.php")
        .addParameter("uid", 51076)
        .addParameter("username", "Rian8337");

    builder.removeParameter("username");

    expect(builder.buildURL()).toBe(
        droidHostname +
            `getuserinfo.php?apiKey=${process.env.DROID_API_KEY}&uid=51076&`
    );
});

test("Test osu!droid API request builder fallback", () => {
    const builder = new DroidAPIRequestBuilder().setEndpoint("banscore.php");

    expect(builder.buildURL()).toBe(
        droidHostname +
            `single_score_wipe.php?apiKey=${process.env.DROID_API_KEY}&`
    );

    builder.setEndpoint("rename.php");

    expect(builder.buildURL()).toBe(
        droidHostname + `user_rename.php?apiKey=${process.env.DROID_API_KEY}&`
    );
});

test("Test osu! API URL builder", () => {
    let builder = new OsuAPIRequestBuilder().setEndpoint("get_beatmaps");

    expect(() => builder.buildURL()).toThrow();

    process.env.OSU_API_KEY = "testkey";

    builder = new OsuAPIRequestBuilder().setEndpoint("get_beatmaps");

    expect(builder.buildURL()).toBe(
        osuHostname + `get_beatmaps?k=${process.env.OSU_API_KEY}&`
    );
});
