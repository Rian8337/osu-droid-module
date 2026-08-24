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
