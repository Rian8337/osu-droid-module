# API request visibility & error handling — design

## Problem

`APIRequestBuilder.sendRequest()` (packages/osu-base/src/online/APIRequestBuilder.ts) hides information callers need to diagnose failures:

- `RequestResponse` only exposes `data` and `statusCode` — no response headers. A 429 from the osu! API carries no `Retry-After` or rate-limit headers the caller can see, so consumers (e.g. `MapInfo.getInformation`) can't tell the user anything more useful than "osu! API error".
- A genuine network-level failure (fetch() itself throwing — DNS, timeout, connection refused) is caught and disguised as `{ data: Buffer.from([]), statusCode: 400 }`, indistinguishable from a real HTTP 400 from the API.
- Retry state (`fetchAttempts`) lives on the builder instance and is mutated via recursive `sendRequest()` calls. This is fragile if a builder instance is ever reused or called concurrently.
- The four call sites that check `result.statusCode !== 200` (`MapInfo.getInformation`, `Player`, `Score`, `ReplayAnalyzer`) each handle failure differently (throw one message, throw another, silently return `null`) and none surface status code, status text, or headers to the eventual consumer.

This surfaced concretely when the user hit osu! API 429s with no indication of what happened beyond a generic thrown error.

## Scope

In scope:
- `packages/osu-base/src/online/APIRequestBuilder.ts`
- `packages/osu-base/src/online/RequestResponse.ts`
- New `packages/osu-base/src/online/APIRequestError.ts`
- `packages/osu-base/src/index.ts` (export the new error type)
- Call sites: `MapInfo.getInformation` (osu-base), `Player.getInformation`/related (osu-droid-utilities), `Score`-related fetch (osu-droid-utilities), `ReplayAnalyzer`-related fetch (osu-droid-replay-analyzer)

Out of scope (explicitly deferred by user decision during brainstorming):
- Automatic `Retry-After`-aware backoff/retry for 429 — the library should expose the information; the calling application decides how to react to rate limiting.
- Making `sendRequest()` reject for non-2xx HTTP statuses — it continues to resolve for any real HTTP response (mirrors `fetch()`'s own resolve/reject contract). Only a genuine transport-level failure becomes a rejection.
- Changing `ReplayAnalyzer`'s "return `null` on failure" contract, or `MapInfo`/`Player`/`Score`'s "throw" contract — each keeps its existing failure shape, just with richer diagnostic content.

## Design

### 1. `RequestResponse` gains headers and diagnostic fields

```ts
export interface RequestResponse {
    readonly data: Buffer;
    readonly statusCode: number;
    readonly statusText: string;
    readonly headers: Record<string, string>;
    readonly url: string;
    readonly attempts: number;
}
```

- `headers` — captured from the `Response.headers` of the actual HTTP response that was received (built via `Object.fromEntries(res.headers.entries())`).
- `statusText` — `res.statusText` (e.g. `"Too Many Requests"` for 429), so error messages don't need a status-code lookup table.
- `url` — `res.url`, the final URL after any redirects `fetch` followed. Useful when it diverges from the URL the builder constructed.
- `attempts` — how many attempts the retry loop took to produce this response (1 if it succeeded first try).

This is a breaking change to the `RequestResponse` shape (three new required fields), but all existing fields are unchanged and additive-only for consumers reading the object; nothing currently constructs a `RequestResponse` literal outside `APIRequestBuilder` itself.

### 2. `APIRequestError` — new error type for transport-level failure

New file `packages/osu-base/src/online/APIRequestError.ts`:

```ts
export class APIRequestError extends Error {
    constructor(
        message: string,
        readonly url: string,
        readonly attempts: number,
        override readonly cause: unknown,
    ) {
        super(message);
        this.name = "APIRequestError";
    }
}
```

`sendRequest()` throws this only when `fetch()` itself threw (network failure) on every one of the retry attempts. It is exported from `packages/osu-base/src/index.ts` (`export * from "./online/APIRequestError";`) so consuming packages can `instanceof`-check it.

This does **not** cover non-2xx HTTP responses — those are real, receivable responses and continue to resolve normally via `RequestResponse`, per the scope decision above.

### 3. `sendRequest()` rewrite — no more recursion, no more instance-mutable retry state, backoff between attempts

Replace the recursive implementation and the `fetchAttempts` instance field with a single `async` method using a local loop and an exponential-backoff-with-jitter delay between attempts:

```ts
private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

private static backoffDelay(attempt: number): number {
    const base = 250; // ms
    const exponential = base * 2 ** (attempt - 1);
    const jitter = exponential * 0.25 * Math.random();

    return exponential + jitter;
}

async sendRequest(): Promise<RequestResponse> {
    const url = this.buildURL();
    const maxAttempts = 5;
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
                continue;
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

With `base = 250ms` doubling per attempt and up to 25% jitter, delays before attempts 2–5 are roughly 250ms, 500ms, 1000ms, 2000ms (±jitter) — about 4 seconds of added worst-case latency across all 5 attempts, before the final failure is surfaced or a later attempt succeeds.

Behavior changes from today:
- Network-level failures (`fetch()` throwing) are now retried up to 5 times, same as 5xx responses (previously they failed immediately with a fabricated 400). This was an explicit decision during brainstorming — both are transient failure modes and deserve the same treatment.
- Both failure modes now wait with exponential backoff + jitter between attempts, instead of retrying back-to-back — considerate of a struggling server and more likely to let a transient blip clear.
- No instance field is mutated; the method is safe to call concurrently on the same builder instance.
- On exhausting retries for a genuine transport failure, the promise **rejects** with `APIRequestError` instead of resolving with fabricated data. Callers that only handled `statusCode !== 200` before now need a `try/catch` (or the rejection propagates, same as any other thrown error) — see call site updates below.

### 4. Call site updates

Each existing call site keeps its current failure *shape* (throw vs. return `null`), but the message/log now includes the new diagnostic fields, and each wraps its `sendRequest()` call to handle the new possible rejection consistently with its existing failure shape.

- **`MapInfo.getInformation`** (packages/osu-base/src/online/MapInfo.ts:327-331): on `statusCode !== 200`, throw includes status code, status text, and (when present) a `Retry-After` header value, e.g. `` `osu! API error: ${result.statusCode} ${result.statusText}` `` plus a `Retry-After` clause when the header exists. A thrown `APIRequestError` from `sendRequest()` propagates as-is (already a descriptive `Error`).
- **`Player`** (packages/osu-droid-utilities/src/Player.ts:99-101) and **`Score`** (packages/osu-droid-utilities/src/Score.ts:193-195): same enrichment pattern — include status code/text/Retry-After in the thrown message.
- **`ReplayAnalyzer`** (packages/osu-droid-replay-analyzer/src/ReplayAnalyzer.ts:536-538): keeps returning `null` on non-200, but adds a `console.error` with the same diagnostic detail beforehand (currently fails with zero trace). An `APIRequestError` rejection is caught and logged the same way, still resulting in `null`.

No behavior changes to what each call site returns/throws on *success*, or to the "what counts as failure" logic (still `statusCode !== 200`) — only to what information rides along with the failure.

## Testing

- Unit tests for `APIRequestBuilder.sendRequest()` (new, package has no existing tests for this file) mocking `global.fetch`:
  - Resolves with full `RequestResponse` shape (headers/statusText/url/attempts) on a 200.
  - Retries on 5xx up to 5 attempts, then resolves with the final 5xx response.
  - Retries on thrown fetch error up to 5 attempts, then rejects with `APIRequestError` carrying `.cause` and `.attempts`.
  - Does not mutate/leak state across two concurrent `sendRequest()` calls on the same instance.
  - Uses Jest fake timers (`jest.useFakeTimers()`) to advance past the backoff delay between attempts without the test actually waiting ~4 seconds.
- Existing call-site tests (if any) updated to match new error message content; otherwise no test coverage currently exists for `MapInfo`/`Player`/`Score`/`ReplayAnalyzer` failure paths — none added beyond what's needed to not break `pnpm test`.

## Risks / open questions

- `RequestResponse` and `sendRequest()`'s rejection behavior are breaking changes for anyone consuming `osu-base` directly outside this monorepo (e.g. Alice, droidppboard, tournament-set-maker) if they call `sendRequest()` themselves rather than going through `MapInfo`/`Player`/`Score`. Grep of this monorepo shows no other internal consumers beyond the four call sites already listed.
