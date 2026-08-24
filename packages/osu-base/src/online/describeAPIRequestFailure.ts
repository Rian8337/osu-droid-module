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
