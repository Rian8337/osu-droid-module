import {
    APIRequestError,
    DroidAPIRequestBuilder,
    OsuAPIRequestBuilder,
} from "../../src";

const droidHostname = "https://osudroid.moe/api/";
const osuHostname = "https://osu.ppy.sh/api/";
const droidKey = "testdroidkey";
const osuKey = "testosukey";

DroidAPIRequestBuilder.setAPIKey(droidKey);
OsuAPIRequestBuilder.setAPIKey(osuKey);

describe("Test setting endpoint", () => {
    test("Not upload endpoint", () => {
        const builder = new DroidAPIRequestBuilder();

        builder.setEndpoint("getuserinfo.php");

        expect(builder.buildURL()).toBe(
            droidHostname + `getuserinfo.php?apiKey=${droidKey}&`,
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
            droidHostname + `getuserinfo.php?apiKey=${droidKey}&uid=51076&`,
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
        droidHostname + `getuserinfo.php?apiKey=${droidKey}&uid=51076&`,
    );
});

test("Test osu! API URL builder", () => {
    const builder = new OsuAPIRequestBuilder().setEndpoint("get_beatmaps");

    expect(builder.buildURL()).toBe(osuHostname + `get_beatmaps?k=${osuKey}&`);
});

function mockResponse(
    status: number,
    statusText: string,
    headers: Record<string, string> = {},
    body = "",
    url = "https://example.test/",
): Response {
    return {
        status,
        statusText,
        url,
        headers: new Headers(headers),
        arrayBuffer: () => Promise.resolve(Buffer.from(body)),
    } as unknown as Response;
}

describe("Test sendRequest", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test("Resolves with full response shape on first success", async () => {
        jest.mocked(global.fetch).mockResolvedValueOnce(
            mockResponse(200, "OK", { "content-type": "application/json" }, "{}"),
        );

        const builder = new DroidAPIRequestBuilder().setEndpoint(
            "getuserinfo.php",
        );

        const result = await builder.sendRequest();

        expect(result.statusCode).toBe(200);
        expect(result.statusText).toBe("OK");
        expect(result.headers["content-type"]).toBe("application/json");
        expect(result.url).toBe("https://example.test/");
        expect(result.attempts).toBe(1);
        expect(result.data.toString("utf-8")).toBe("{}");
    });

    test("Retries on 5xx with backoff, then resolves with the final response", async () => {
        jest.mocked(global.fetch)
            .mockResolvedValueOnce(mockResponse(503, "Service Unavailable"))
            .mockResolvedValueOnce(mockResponse(503, "Service Unavailable"))
            .mockResolvedValueOnce(mockResponse(200, "OK"));

        const builder = new DroidAPIRequestBuilder().setEndpoint(
            "getuserinfo.php",
        );

        const promise = builder.sendRequest();
        await jest.runAllTimersAsync();
        const result = await promise;

        expect(global.fetch).toHaveBeenCalledTimes(3);
        expect(result.statusCode).toBe(200);
        expect(result.attempts).toBe(3);
    });

    test("Retries on thrown network error with backoff, then rejects with APIRequestError", async () => {
        const networkError = new Error("fetch failed");

        jest.mocked(global.fetch).mockRejectedValue(networkError);

        const builder = new DroidAPIRequestBuilder().setEndpoint(
            "getuserinfo.php",
        );

        const promise = builder.sendRequest();
        promise.catch(() => {}); // prevent unhandled-rejection warning while timers drain
        await jest.runAllTimersAsync();

        await expect(promise).rejects.toThrow(APIRequestError);
        await expect(promise).rejects.toMatchObject({
            attempts: 5,
            cause: networkError,
        });
        expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    test("Does not share retry state across concurrent calls on the same instance", async () => {
        // Keyed by URL rather than call order, so the assertions don't depend on how
        // the two concurrent calls' retries happen to interleave in time.
        let firstAttempts = 0;
        let secondAttempts = 0;

        jest.mocked(global.fetch).mockImplementation((input) => {
            const url = input.toString();

            if (url.includes("first=1")) {
                ++firstAttempts;

                return Promise.resolve(
                    firstAttempts < 3
                        ? mockResponse(503, "Service Unavailable")
                        : mockResponse(200, "OK", {}, "first"),
                );
            }

            ++secondAttempts;

            return Promise.resolve(mockResponse(200, "OK", {}, "second"));
        });

        const builder = new DroidAPIRequestBuilder().setEndpoint(
            "getuserinfo.php",
        );

        // buildURL() runs synchronously at the top of sendRequest(), before its first
        // await, so mutating params for the second call after starting the first is safe.
        builder.addParameter("first", 1);
        const firstPromise = builder.sendRequest();

        builder.removeParameter("first").addParameter("second", 1);
        const secondPromise = builder.sendRequest();

        await jest.runAllTimersAsync();

        const [first, second] = await Promise.all([firstPromise, secondPromise]);

        expect(first.data.toString("utf-8")).toBe("first");
        expect(first.attempts).toBe(3);
        expect(second.data.toString("utf-8")).toBe("second");
        expect(second.attempts).toBe(1);
    });
});
