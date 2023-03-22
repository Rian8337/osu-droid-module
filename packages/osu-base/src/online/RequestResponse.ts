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
}
