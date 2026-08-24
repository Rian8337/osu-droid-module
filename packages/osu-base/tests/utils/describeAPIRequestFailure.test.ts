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
