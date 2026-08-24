# API Request Visibility & Error Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose response headers/status text/URL/attempt count from `APIRequestBuilder.sendRequest()`, replace the fabricated-400-on-network-failure behavior with a typed `APIRequestError`, remove the shared mutable retry-count instance field, add exponential backoff with jitter between retries, and surface the new diagnostic detail in the four call sites that currently swallow it.

**Architecture:** All changes are additive to `packages/osu-base/src/online/` (the only package that owns request/retry logic), plus one-line enrichments to the three downstream call sites in `osu-droid-utilities` and `osu-droid-replay-analyzer` that consume `sendRequest()`. `osu-base` must be rebuilt after its changes land, since the downstream packages import its compiled `dist`/`typings`, not `src`.

**Tech Stack:** TypeScript, Jest + ts-jest (isolated modules), Node's global `fetch`/`Headers`/`Response`, Jest fake timers for backoff-delay tests.

**Spec:** `docs/superpowers/specs/2026-08-24-api-request-visibility-design.md`

## Global Constraints

- Modules only support osu!standard beatmaps (no ruleset-agnostic concerns here, but don't introduce anything that isn't).
- `sendRequest()` still resolves (never rejects) for any real HTTP response, whatever the status code — only a genuine transport-level failure (fetch throwing on every attempt) rejects, with `APIRequestError`.
- Retry attempts stay capped at 5 total, for both 5xx responses and network-level exceptions.
- Backoff between attempts: exponential with jitter, base 250ms, doubling per attempt, up to 25% random jitter (attempt delays roughly 250/500/1000/2000ms before attempts 2–5).
- No call site's failure *shape* changes (`MapInfo`/`Player`/`Score` still throw, `ReplayAnalyzer` still returns `null`) — only the diagnostic detail attached to that failure.
- Cross-package imports use the published package name (`@rian8337/osu-base`), never relative paths, per this repo's convention.
- Every number interpolated into a template literal must be explicitly `.toString()`'d (matches this codebase's existing lint-clean style).

---

### Task 1: `RequestResponse` shape, `APIRequestError`, and the `sendRequest()` rewrite

**Files:**
- Modify: `packages/osu-base/src/online/RequestResponse.ts`
- Create: `packages/osu-base/src/online/APIRequestError.ts`
- Modify: `packages/osu-base/src/online/APIRequestBuilder.ts`
- Modify: `packages/osu-base/src/index.ts`
- Test: `packages/osu-base/tests/utils/APIRequestBuilder.test.ts`

**Interfaces:**
- Produces: `RequestResponse` interface with fields `{ data: Buffer, statusCode: number, statusText: string, headers: Record<string, string>, url: string, attempts: number }`.
- Produces: `APIRequestError` class — `new APIRequestError(message: string, url: string, attempts: number, cause: unknown)`, extends `Error`, sets `.name = "APIRequestError"`, forwards `cause` to `Error`'s built-in `.cause`.
- Produces: `APIRequestBuilder.sendRequest(): Promise<RequestResponse>` — same public signature as today, but now backed by a non-recursive loop with no `fetchAttempts` instance field, resolves with the new `RequestResponse` shape for any real HTTP response, and rejects with `APIRequestError` only when every attempt's `fetch()` call itself threw.

- [ ] **Step 1: Write the failing tests**

In `packages/osu-base/tests/utils/APIRequestBuilder.test.ts`, change the first line from:

```ts
import { DroidAPIRequestBuilder, OsuAPIRequestBuilder } from "../../src";
```

to:

```ts
import {
    APIRequestError,
    DroidAPIRequestBuilder,
    OsuAPIRequestBuilder,
} from "../../src";
```

Keep every existing test in the file untouched, and append this helper plus these new `describe` blocks at the end of the file:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/osu-base && npx jest tests/utils/APIRequestBuilder.test.ts`
Expected: FAIL — `RequestResponse`/`APIRequestError` don't have the new shape yet, `APIRequestError` doesn't exist, and today's `sendRequest()` doesn't retry network errors or attach `statusText`/`headers`/`url`/`attempts`.

- [ ] **Step 3: Extend `RequestResponse`**

Replace the contents of `packages/osu-base/src/online/RequestResponse.ts`:

```ts
/**
 * Represents the structure of a response from a network request.
 */
export interface RequestResponse {
    /**
     * The result of the API request.
     */
    readonly data: Buffer;

    /**
     * The status code of the API request.
     */
    readonly statusCode: number;

    /**
     * The status text of the API request (e.g., "Too Many Requests" for status code 429).
     */
    readonly statusText: string;

    /**
     * The response headers of the API request, keyed by lowercase header name.
     */
    readonly headers: Record<string, string>;

    /**
     * The final URL of the API request, after any redirects.
     */
    readonly url: string;

    /**
     * The amount of attempts it took to obtain this response.
     */
    readonly attempts: number;
}
```

- [ ] **Step 4: Create `APIRequestError`**

Create `packages/osu-base/src/online/APIRequestError.ts`:

```ts
/**
 * Represents a transport-level failure of an API request (e.g., DNS failure, timeout,
 * connection refused) that persisted across every retry attempt.
 *
 * This is distinct from a received HTTP response with a non-2xx status code, which is
 * not an error at the transport level and is represented by a normal `RequestResponse`.
 */
export class APIRequestError extends Error {
    /**
     * @param message The error message.
     * @param url The URL that was requested.
     * @param attempts The amount of attempts that were made before giving up.
     * @param cause The underlying error that was thrown on the final attempt.
     */
    constructor(
        message: string,
        readonly url: string,
        readonly attempts: number,
        cause: unknown,
    ) {
        super(message, { cause });

        this.name = "APIRequestError";
    }
}
```

- [ ] **Step 5: Export `APIRequestError` from the package index**

In `packages/osu-base/src/index.ts`, find the `online/` export block:

```ts
export * from "./online/BeatmapGenre";
export * from "./online/BeatmapLanguage";
export * from "./online/DroidAPIRequestBuilder";
export * from "./online/MapInfo";
export * from "./online/OsuAPIRequestBuilder";
export * from "./online/RequestResponse";
```

Add the new export, keeping alphabetical order:

```ts
export * from "./online/APIRequestError";
export * from "./online/BeatmapGenre";
export * from "./online/BeatmapLanguage";
export * from "./online/DroidAPIRequestBuilder";
export * from "./online/MapInfo";
export * from "./online/OsuAPIRequestBuilder";
export * from "./online/RequestResponse";
```

- [ ] **Step 6: Rewrite `APIRequestBuilder.sendRequest()`**

In `packages/osu-base/src/online/APIRequestBuilder.ts`:

1. The file currently starts with:

```ts
import { RequestResponse } from "./RequestResponse";
```

Add the new import above it:

```ts
import { APIRequestError } from "./APIRequestError";
import { RequestResponse } from "./RequestResponse";
```

2. Delete the `private fetchAttempts = 0;` field.

3. Replace the existing `sendRequest()` method, including its doc comment (it sits between `buildURL()` and `addParameter()`):

```ts
    /**
     * Sends a request to the API using built parameters.
     *
     * If the request fails, it will be redone 5 times.
     */
    sendRequest(): Promise<RequestResponse> {
        return new Promise((resolve) => {
            const url = this.buildURL();

            fetch(url)
                .then(async (res) => {
                    ++this.fetchAttempts;

                    if (res.status >= 500 && this.fetchAttempts < 5) {
                        console.error(
                            `Request to ${url} failed with the following error: ${await res.text()}; ${this.fetchAttempts.toString()} attempts so far; retrying`,
                        );

                        resolve(this.sendRequest());
                        return;
                    }

                    this.fetchAttempts = 0;

                    resolve({
                        data: Buffer.from(await res.arrayBuffer()),
                        statusCode: res.status,
                    });
                })
                .catch((e: unknown) => {
                    console.error(
                        `Request to ${url} failed with the following error: ${(e as Error).message}; ${this.fetchAttempts.toString()} attempts so far; aborting`,
                    );

                    this.fetchAttempts = 0;

                    resolve({
                        data: Buffer.from([]),
                        statusCode: 400,
                    });

                    return;
                });
        });
    }
```

with:

```ts
    /**
     * The maximum amount of attempts `sendRequest` will make before giving up.
     */
    private static readonly maxAttempts = 5;

    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private static backoffDelay(attempt: number): number {
        const base = 250;
        const exponential = base * 2 ** (attempt - 1);
        const jitter = exponential * 0.25 * Math.random();

        return exponential + jitter;
    }

    /**
     * Sends a request to the API using built parameters.
     *
     * If the request fails (a 5xx response, or the request itself throwing), it will be
     * retried up to 5 times with exponential backoff between attempts.
     *
     * Resolves with the response for any HTTP response actually received, whatever its
     * status code. Only rejects with an `APIRequestError` if every attempt's request threw
     * (e.g., DNS failure, timeout, connection refused) rather than receiving a response.
     */
    async sendRequest(): Promise<RequestResponse> {
        const url = this.buildURL();
        const maxAttempts = APIRequestBuilder.maxAttempts;
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxAttempts; ++attempt) {
            try {
                const res = await fetch(url);

                if (res.status >= 500 && attempt < maxAttempts) {
                    console.error(
                        `Request to ${url} failed with status ${res.status.toString()}; attempt ${attempt.toString()} of ${maxAttempts.toString()}; retrying`,
                    );

                    await APIRequestBuilder.delay(
                        APIRequestBuilder.backoffDelay(attempt),
                    );

                    continue;
                }

                return {
                    data: Buffer.from(await res.arrayBuffer()),
                    statusCode: res.status,
                    statusText: res.statusText,
                    headers: Object.fromEntries(res.headers.entries()),
                    url: res.url,
                    attempts: attempt,
                };
            } catch (e) {
                lastError = e;

                if (attempt < maxAttempts) {
                    console.error(
                        `Request to ${url} failed with error: ${(e as Error).message}; attempt ${attempt.toString()} of ${maxAttempts.toString()}; retrying`,
                    );

                    await APIRequestBuilder.delay(
                        APIRequestBuilder.backoffDelay(attempt),
                    );
                }
            }
        }

        throw new APIRequestError(
            `Request to ${url} failed after ${maxAttempts.toString()} attempts`,
            url,
            maxAttempts,
            lastError,
        );
    }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `cd packages/osu-base && npx jest tests/utils/APIRequestBuilder.test.ts`
Expected: PASS — all new and existing tests green.

- [ ] **Step 8: Run the full osu-base test suite and lint**

Run: `cd packages/osu-base && pnpm test && pnpm lint`
Expected: PASS with no new failures or lint errors.

- [ ] **Step 9: Commit**

```bash
git add packages/osu-base/src/online/RequestResponse.ts \
        packages/osu-base/src/online/APIRequestError.ts \
        packages/osu-base/src/online/APIRequestBuilder.ts \
        packages/osu-base/src/index.ts \
        packages/osu-base/tests/utils/APIRequestBuilder.test.ts
git commit -m "Expose response headers/status/url/attempts and add APIRequestError

sendRequest() no longer masks a genuine network failure as a fabricated
400 response, no longer mutates shared instance state across retries,
and now backs off exponentially with jitter between attempts."
```

---

### Task 2: Shared `describeAPIRequestFailure` helper

**Files:**
- Create: `packages/osu-base/src/online/describeAPIRequestFailure.ts`
- Modify: `packages/osu-base/src/index.ts`
- Test: `packages/osu-base/tests/utils/describeAPIRequestFailure.test.ts`

**Interfaces:**
- Consumes: `RequestResponse` from Task 1 (`{ statusCode, statusText, headers, ... }`).
- Produces: `describeAPIRequestFailure(result: RequestResponse): string` — formats `"{statusCode} {statusText}"`, appending `" (Retry-After: {value})"` when a `retry-after` header is present. Used by Task 3–5's call sites so all three format their diagnostic detail identically.

- [ ] **Step 1: Write the failing test**

Create `packages/osu-base/tests/utils/describeAPIRequestFailure.test.ts`:

```ts
import { describeAPIRequestFailure, RequestResponse } from "../../src";

function response(
    statusCode: number,
    statusText: string,
    headers: Record<string, string> = {},
): RequestResponse {
    return {
        data: Buffer.from([]),
        statusCode,
        statusText,
        headers,
        url: "https://example.test/",
        attempts: 1,
    };
}

test("Test description without Retry-After header", () => {
    expect(describeAPIRequestFailure(response(500, "Internal Server Error"))).toBe(
        "500 Internal Server Error",
    );
});

test("Test description with Retry-After header", () => {
    expect(
        describeAPIRequestFailure(
            response(429, "Too Many Requests", { "retry-after": "30" }),
        ),
    ).toBe("429 Too Many Requests (Retry-After: 30)");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/osu-base && npx jest tests/utils/describeAPIRequestFailure.test.ts`
Expected: FAIL — `describeAPIRequestFailure` doesn't exist.

- [ ] **Step 3: Implement `describeAPIRequestFailure`**

Create `packages/osu-base/src/online/describeAPIRequestFailure.ts`:

```ts
import { RequestResponse } from "./RequestResponse";

/**
 * Formats the status code, status text, and (if present) `Retry-After` header of a
 * `RequestResponse` into a human-readable diagnostic string, e.g.
 * `"429 Too Many Requests (Retry-After: 30)"`.
 *
 * @param result The response to describe.
 */
export function describeAPIRequestFailure(result: RequestResponse): string {
    const retryAfter = result.headers["retry-after"];

    return (
        `${result.statusCode.toString()} ${result.statusText}` +
        (retryAfter ? ` (Retry-After: ${retryAfter})` : "")
    );
}
```

- [ ] **Step 4: Export it from the package index**

In `packages/osu-base/src/index.ts`, add this line to the `online/` export block (position within the block doesn't matter functionally; add it right after the `./online/DroidAPIRequestBuilder` line):

```ts
export * from "./online/describeAPIRequestFailure";
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd packages/osu-base && npx jest tests/utils/describeAPIRequestFailure.test.ts`
Expected: PASS

- [ ] **Step 6: Build `osu-base` so downstream packages pick up the new exports**

Run: `cd packages/osu-base && pnpm build`
Expected: builds cleanly, `dist/index.js` and `typings/index.d.ts` now include `APIRequestError` and `describeAPIRequestFailure`.

- [ ] **Step 7: Commit**

```bash
git add packages/osu-base/src/online/describeAPIRequestFailure.ts \
        packages/osu-base/src/index.ts \
        packages/osu-base/tests/utils/describeAPIRequestFailure.test.ts
git commit -m "Add describeAPIRequestFailure helper for uniform failure diagnostics"
```

---

### Task 3: `MapInfo.getInformation` — enrich the thrown error

**Files:**
- Modify: `packages/osu-base/src/online/MapInfo.ts:327-331`
- Test: `packages/osu-base/tests/tools/MapInfo.test.ts`

**Interfaces:**
- Consumes: `describeAPIRequestFailure` from Task 2, `OsuAPIRequestBuilder` (already imported in this file).

- [ ] **Step 1: Write the failing test**

In `packages/osu-base/tests/tools/MapInfo.test.ts`, replace the first line:

```ts
import { OsuAPIResponse, MapInfo } from "../../src";
```

with:

```ts
import { OsuAPIResponse, MapInfo, OsuAPIRequestBuilder } from "../../src";
```

Then append at the end of the file:

```ts
test("Test getInformation surfaces status detail on non-200 response", async () => {
    jest.spyOn(OsuAPIRequestBuilder.prototype, "sendRequest").mockResolvedValueOnce({
        data: Buffer.from([]),
        statusCode: 429,
        statusText: "Too Many Requests",
        headers: { "retry-after": "30" },
        url: "https://osu.ppy.sh/api/get_beatmaps",
        attempts: 1,
    });

    await expect(MapInfo.getInformation(252002)).rejects.toThrow(
        "osu! API error: 429 Too Many Requests (Retry-After: 30)",
    );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/osu-base && npx jest tests/tools/MapInfo.test.ts`
Expected: FAIL — current message is just `"osu! API error"`.

- [ ] **Step 3: Update `MapInfo.getInformation`**

In `packages/osu-base/src/online/MapInfo.ts`, add the import near the other `./` imports:

```ts
import { describeAPIRequestFailure } from "./describeAPIRequestFailure";
```

Replace:

```ts
        if (result.statusCode !== 200) {
            throw new Error("osu! API error");
        }
```

with:

```ts
        if (result.statusCode !== 200) {
            throw new Error(
                `osu! API error: ${describeAPIRequestFailure(result)}`,
            );
        }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd packages/osu-base && npx jest tests/tools/MapInfo.test.ts`
Expected: PASS

- [ ] **Step 5: Run the full osu-base test suite and lint**

Run: `cd packages/osu-base && pnpm test && pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/osu-base/src/online/MapInfo.ts packages/osu-base/tests/tools/MapInfo.test.ts
git commit -m "Surface status code/text/Retry-After in MapInfo's API error"
```

---

### Task 4: `Player.getInformation` — enrich the thrown error

**Files:**
- Modify: `packages/osu-droid-utilities/src/Player.ts:1,99-101`
- Test: `packages/osu-droid-utilities/tests/Player.test.ts`

**Interfaces:**
- Consumes: `describeAPIRequestFailure` from Task 2 (imported via `@rian8337/osu-base`, requires the Task 2 build).

- [ ] **Step 1: Write the failing test**

`packages/osu-droid-utilities/tests/Player.test.ts` currently starts with:

```ts
import { APIPlayer } from "../src/APIPlayer";
import { Player } from "../src/Player";
```

Add a new import line above those two:

```ts
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { APIPlayer } from "../src/APIPlayer";
import { Player } from "../src/Player";
```

Then append at the end of the file:

```ts
test("Test getInformation surfaces status detail on non-200 response", async () => {
    jest.spyOn(DroidAPIRequestBuilder.prototype, "sendRequest").mockResolvedValueOnce({
        data: Buffer.from([]),
        statusCode: 429,
        statusText: "Too Many Requests",
        headers: { "retry-after": "30" },
        url: "https://osudroid.moe/api/getuserinfo.php",
        attempts: 1,
    });

    await expect(Player.getInformation(51076)).rejects.toThrow(
        "Error retrieving player data: 429 Too Many Requests (Retry-After: 30)",
    );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/osu-droid-utilities && npx jest tests/Player.test.ts`
Expected: FAIL — current message is just `"Error retrieving player data"`.

- [ ] **Step 3: Update `Player.getInformation`**

In `packages/osu-droid-utilities/src/Player.ts`, change the import at line 1:

```ts
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
```

to:

```ts
import { describeAPIRequestFailure, DroidAPIRequestBuilder } from "@rian8337/osu-base";
```

Replace:

```ts
        const result = await apiRequestBuilder.sendRequest();
        if (result.statusCode !== 200) {
            throw new Error("Error retrieving player data");
        }
```

with:

```ts
        const result = await apiRequestBuilder.sendRequest();
        if (result.statusCode !== 200) {
            throw new Error(
                `Error retrieving player data: ${describeAPIRequestFailure(result)}`,
            );
        }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd packages/osu-droid-utilities && npx jest tests/Player.test.ts`
Expected: PASS

- [ ] **Step 5: Run the full osu-droid-utilities test suite and lint**

Run: `cd packages/osu-droid-utilities && pnpm test && pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/osu-droid-utilities/src/Player.ts packages/osu-droid-utilities/tests/Player.test.ts
git commit -m "Surface status code/text/Retry-After in Player's API error"
```

---

### Task 5: `Score.getFromHash` — enrich the thrown error

**Files:**
- Modify: `packages/osu-droid-utilities/src/Score.ts:1-8,193-195`
- Test: `packages/osu-droid-utilities/tests/Score.test.ts`

**Interfaces:**
- Consumes: `describeAPIRequestFailure` from Task 2 (imported via `@rian8337/osu-base`).

- [ ] **Step 1: Write the failing test**

`packages/osu-droid-utilities/tests/Score.test.ts` currently starts with:

```ts
import { ModHidden } from "@rian8337/osu-base";
import { Score } from "../src/Score";
import { APIScore } from "../src/APIScore";
```

`Score` is already imported. Change the first line to also bring in `DroidAPIRequestBuilder`:

```ts
import { DroidAPIRequestBuilder, ModHidden } from "@rian8337/osu-base";
import { Score } from "../src/Score";
import { APIScore } from "../src/APIScore";
```

Append at the end of the file:

```ts
test("Test getFromHash surfaces status detail on non-200 response", async () => {
    jest.spyOn(DroidAPIRequestBuilder.prototype, "sendRequest").mockResolvedValueOnce({
        data: Buffer.from([]),
        statusCode: 429,
        statusText: "Too Many Requests",
        headers: { "retry-after": "30" },
        url: "https://osudroid.moe/api/scoresearchv2.php",
        attempts: 1,
    });

    await expect(Score.getFromHash(51076, "somehash")).rejects.toThrow(
        "Error retrieving score data: 429 Too Many Requests (Retry-After: 30)",
    );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/osu-droid-utilities && npx jest tests/Score.test.ts`
Expected: FAIL — current message is just `"Error retrieving score data"`.

- [ ] **Step 3: Update `Score.getFromHash`**

In `packages/osu-droid-utilities/src/Score.ts`, replace the import block at the top:

```ts
import {
    Accuracy,
    DroidAPIRequestBuilder,
    ModMap,
    ModUtil,
    ScoreRank,
} from "@rian8337/osu-base";
```

with:

```ts
import {
    Accuracy,
    describeAPIRequestFailure,
    DroidAPIRequestBuilder,
    ModMap,
    ModUtil,
    ScoreRank,
} from "@rian8337/osu-base";
```

Then replace:

```ts
        if (result.statusCode !== 200) {
            throw new Error("Error retrieving score data");
        }
```

with:

```ts
        if (result.statusCode !== 200) {
            throw new Error(
                `Error retrieving score data: ${describeAPIRequestFailure(result)}`,
            );
        }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd packages/osu-droid-utilities && npx jest tests/Score.test.ts`
Expected: PASS

- [ ] **Step 5: Run the full osu-droid-utilities test suite and lint**

Run: `cd packages/osu-droid-utilities && pnpm test && pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/osu-droid-utilities/src/Score.ts packages/osu-droid-utilities/tests/Score.test.ts
git commit -m "Surface status code/text/Retry-After in Score's API error"
```

---

### Task 6: `ReplayAnalyzer.downloadReplay` — log diagnostic detail before returning `null`

**Files:**
- Modify: `packages/osu-droid-replay-analyzer/src/ReplayAnalyzer.ts:1-45,536-538`

**Interfaces:**
- Consumes: `describeAPIRequestFailure` from Task 2 (imported via `@rian8337/osu-base`).

No new test is added for this task: `downloadReplay` is a private method with no existing test scaffolding or fetch-mocking convention in this package (confirmed during design — only `ReplayV3Data.test.ts` exists here, unrelated to networking), and per the design spec this call site's contract (`return null` on failure) stays unchanged — only a log line is added. Verification is via lint/build plus the existing test suite staying green.

- [ ] **Step 1: Add the import**

In `packages/osu-droid-replay-analyzer/src/ReplayAnalyzer.ts`, the import block from `@rian8337/osu-base` currently starts:

```ts
import {
    Accuracy,
    Beatmap,
    BeatmapDifficulty,
    Circle,
    DroidAPIRequestBuilder,
```

Add `describeAPIRequestFailure` in alphabetical position, right after `Circle,`:

```ts
import {
    Accuracy,
    Beatmap,
    BeatmapDifficulty,
    Circle,
    describeAPIRequestFailure,
    DroidAPIRequestBuilder,
```

- [ ] **Step 2: Log diagnostic detail before returning `null`**

Replace:

```ts
        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            return null;
        }
```

with:

```ts
        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            console.error(
                `Error retrieving replay for score ID ${this.scoreID.toString()}: ${describeAPIRequestFailure(result)}`,
            );

            return null;
        }
```

- [ ] **Step 3: Run the full osu-droid-replay-analyzer test suite and lint**

Run: `cd packages/osu-droid-replay-analyzer && pnpm test && pnpm lint`
Expected: PASS — no behavior change to any existing test, since none exercise this path.

- [ ] **Step 4: Commit**

```bash
git add packages/osu-droid-replay-analyzer/src/ReplayAnalyzer.ts
git commit -m "Log status code/text/Retry-After before ReplayAnalyzer gives up on a replay download"
```

---

### Task 7: Full monorepo verification

**Files:** none (verification only)

- [ ] **Step 1: Build everything**

Run: `pnpm build`
Expected: all packages build cleanly.

- [ ] **Step 2: Lint everything**

Run: `pnpm lint`
Expected: no lint errors in any package.

- [ ] **Step 3: Test everything**

Run: `pnpm test`
Expected: all packages' test suites pass.

- [ ] **Step 4: Manually confirm the original motivating scenario**

Re-read `packages/osu-base/src/online/MapInfo.ts`'s updated error path and confirm: a 429 response with a `Retry-After` header now produces an error message of the shape `"osu! API error: 429 Too Many Requests (Retry-After: 30)"` instead of the old bare `"osu! API error"` — this is the exact gap that prompted this work.
