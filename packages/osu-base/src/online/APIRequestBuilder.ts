import { Utils } from "../utils/Utils";
import { APIRequestError } from "./APIRequestError";
import { RequestResponse } from "./RequestResponse";

/**
 * The base of API request builders.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class APIRequestBuilder<TEndpoint extends string> {
    /**
     * The main point of API host.
     */
    protected abstract readonly host: string;

    /**
     * The API key for this builder.
     */
    protected abstract readonly APIkey: string;

    /**
     * The parameter for API key requests.
     */
    protected abstract readonly APIkeyParam: string;

    /**
     * Whether or not to include the API key in the request URL.
     */
    protected requiresAPIkey = true;

    /**
     * The endpoint of this builder.
     */
    protected endpoint = "";

    /**
     * The parameters of this builder.
     */
    protected readonly params = new Map<string, string>();

    /**
     * The base URL of this builder.
     */
    protected get baseURL(): string {
        return this.host + this.endpoint;
    }

    /**
     * Sets the API endpoint.
     *
     * @param endpoint The endpoint to set.
     */
    setEndpoint(endpoint: TEndpoint): this {
        this.endpoint = endpoint;

        return this;
    }

    /**
     * Sets if this builder includes the API key in the request URL.
     *
     * @param requireAPIkey Whether or not to include the API key in the request URL.
     */
    setRequireAPIkey(requireAPIkey: boolean): this {
        this.requiresAPIkey = requireAPIkey;
        return this;
    }

    /**
     * Builds the URL to request the API.
     */
    buildURL(): string {
        let url = this.baseURL + "?";

        if (this.requiresAPIkey) {
            if (!this.APIkey) {
                throw new Error("An API key has not been specified");
            }

            url += this.APIkeyParam;
        }

        for (const [param, value] of this.params.entries()) {
            url += `${param}=${encodeURIComponent(value)}&`;
        }

        return url;
    }

    /**
     * The maximum amount of attempts `sendRequest` will make before giving up.
     */
    private static readonly maxAttempts = 5;

    private static backoffDelay(attempt: number): number {
        const base = 250;
        const exponential = base * 2 ** (attempt - 1);
        const jitter = exponential * 0.25 * Math.random();

        return exponential + jitter;
    }

    /**
     * Redacts the API key value from a URL string so it does not leak into logs or thrown errors.
     */
    private static redactURL(url: string): string {
        return url.replace(/([?&](?:k|apiKey)=)[^&]*/g, "$1<redacted>");
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
                    const body = await res.text();

                    console.error(
                        `Request to ${APIRequestBuilder.redactURL(url)} failed with status ${res.status.toString()}: ${body}; attempt ${attempt.toString()} of ${maxAttempts.toString()}; retrying`,
                    );

                    // Utils.sleep takes seconds; backoffDelay() returns milliseconds.
                    await Utils.sleep(
                        APIRequestBuilder.backoffDelay(attempt) / 1000,
                    );

                    continue;
                }

                return new RequestResponse(
                    res,
                    Buffer.from(await res.arrayBuffer()),
                    attempt,
                );
            } catch (e) {
                lastError = e;

                if (attempt < maxAttempts) {
                    console.error(
                        `Request to ${APIRequestBuilder.redactURL(url)} failed with error: ${(e as Error).message}; attempt ${attempt.toString()} of ${maxAttempts.toString()}; retrying`,
                    );

                    // Utils.sleep takes seconds; backoffDelay() returns milliseconds.
                    await Utils.sleep(
                        APIRequestBuilder.backoffDelay(attempt) / 1000,
                    );
                }
            }
        }

        const redactedURL = APIRequestBuilder.redactURL(url);

        throw new APIRequestError(
            `Request to ${redactedURL} failed after ${maxAttempts.toString()} attempts`,
            redactedURL,
            maxAttempts,
            lastError,
        );
    }

    /**
     * Adds a parameter to the builder.
     *
     * @param param The parameter to add.
     * @param value The value to add for the parameter.
     */
    addParameter(param: string, value: string | number): this {
        this.params.set(param, value.toString());
        return this;
    }

    /**
     * Removes a parameter from the builder.
     *
     * @param param The parameter to remove.
     */
    removeParameter(param: string): this {
        this.params.delete(param);
        return this;
    }
}
