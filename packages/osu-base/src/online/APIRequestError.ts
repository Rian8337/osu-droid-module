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
