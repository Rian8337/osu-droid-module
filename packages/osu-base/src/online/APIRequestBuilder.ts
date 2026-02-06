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

    private fetchAttempts = 0;

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
