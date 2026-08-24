import { RequestResponse } from "../../src";

function response(
    statusCode: number,
    statusText: string,
    headers: Record<string, string> = {},
): RequestResponse {
    return new RequestResponse(
        new Response(null, { status: statusCode, statusText, headers }),
        Buffer.from([]),
        1,
    );
}

test("Test description without Retry-After header", () => {
    expect(response(500, "Internal Server Error").describeFailure()).toBe(
        "500 Internal Server Error",
    );
});

test("Test description with Retry-After header", () => {
    expect(
        response(429, "Too Many Requests", {
            "retry-after": "30",
        }).describeFailure(),
    ).toBe("429 Too Many Requests (Retry-After: 30)");
});
