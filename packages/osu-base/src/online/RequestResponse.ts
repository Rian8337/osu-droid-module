/**
 * Wraps the `fetch` response an API request obtained, pairing it with the pre-read
 * request body and the amount of attempts it took to obtain it.
 *
 * The body is read out once, eagerly, rather than lazily from the underlying `Response`
 * itself, since a `fetch` response body stream can only be consumed once - reading it
 * eagerly avoids that footgun and lets `data` be read as many times as needed.
 */
export class RequestResponse {
    /**
     * @param response The raw `fetch` response this result was obtained from.
     * @param data The result of the API request, already read out of `response`'s body.
     * @param attempts The amount of attempts it took to obtain this response.
     */
    constructor(
        private readonly response: Response,
        readonly data: Buffer,
        readonly attempts: number,
    ) {}

    /**
     * The status code of the API request.
     */
    get statusCode(): number {
        return this.response.status;
    }

    /**
     * The status text of the API request (e.g., "Too Many Requests" for status code 429).
     */
    get statusText(): string {
        return this.response.statusText;
    }

    /**
     * The final URL of the API request, after any redirects.
     */
    get url(): string {
        return this.response.url;
    }

    /**
     * The response headers of the API request.
     */
    get headers(): Headers {
        return this.response.headers;
    }

    /**
     * Formats the status code, status text, and (if present) `Retry-After` header of
     * this response into a human-readable diagnostic string, e.g.
     * `"429 Too Many Requests (Retry-After: 30)"`.
     */
    describeFailure(): string {
        const retryAfter = this.headers.get("retry-after");

        return (
            `${this.statusCode.toString()} ${this.statusText}` +
            (retryAfter ? ` (Retry-After: ${retryAfter})` : "")
        );
    }
}
