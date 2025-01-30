import { Utils } from "../../src";

test("Test random array element getter", () => {
    let arr = [1, 2, 3];

    expect(arr).toContain(Utils.getRandomArrayElement(arr));

    arr = [1, 4, 7, 12, 20];

    expect(arr).toContain(Utils.getRandomArrayElement(arr));

    arr = [-2, -12, 15, 2, 21, 9, 5, 23, 16, 12];

    expect(arr).toContain(Utils.getRandomArrayElement(arr));
});

test("Test array initializer", () => {
    let arr = Utils.initializeArray(10);

    expect(arr.length).toBe(10);
    expect(arr.every((m) => typeof m === "undefined")).toBe(true);

    arr = Utils.initializeArray(10, "a");

    expect(arr.length).toBe(10);
    expect(arr.every((m) => m === "a")).toBe(true);

    arr = Utils.initializeArray(5, 5);

    expect(arr.length).toBe(5);
    expect(arr.every((m) => m === 5)).toBe(true);
});

test("Test sleeping function", () => {
    expect(async () => await Utils.sleep(1)).not.toThrow();
});
