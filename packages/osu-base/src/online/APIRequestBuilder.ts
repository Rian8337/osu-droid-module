import { RequestResponse } from "./RequestResponse";

/**
 * The base of API request builders.
 */
export abstract class APIRequestBuilder<Params extends string = string> {
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
    protected requiresAPIkey: boolean = true;

    /**
     * The endpoint of this builder.
     */
    protected endpoint: string = "";

    /**
     * The parameters of this builder.
     */
    protected readonly params: Map<string, string | number> = new Map();

    /**
     * The base URL of this builder.
     */
    protected get baseURL(): string {
        return this.host + this.endpoint;
    }

    private fetchAttempts: number = 0;

    /**
     * Sets the API endpoint.
     *
     * @param endpoint The endpoint to set.
     */
    setEndpoint(endpoint: Params): this {
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
        let url: string = this.baseURL + "?";

        if (this.requiresAPIkey) {
            if (!this.APIkey) {
                throw new Error(
                    "An API key is not specified as environment variable"
                );
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
            const url: string = this.buildURL();

            fetch(url)
                .then(async (res) => {
                    ++this.fetchAttempts;

                    if (res.status >= 500 && this.fetchAttempts < 5) {
                        console.error(
                            `Request to ${url} failed with the following error: ${await res.text()}; ${this.fetchAttempts} attempts so far; retrying`
                        );

                        return resolve(this.sendRequest());
                    }

                    this.fetchAttempts = 0;

                    return resolve({
                        data: Buffer.from(await res.arrayBuffer()),
                        statusCode: res.status,
                    });
                })
                .catch((e: Error) => {
                    console.error(
                        `Request to ${url} failed with the following error: ${e.message}; ${this.fetchAttempts} attempts so far; aborting`
                    );

                    this.fetchAttempts = 0;

                    return resolve({
                        data: Buffer.from([]),
                        statusCode: 400,
                    });
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
        this.params.set(param, value);
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
