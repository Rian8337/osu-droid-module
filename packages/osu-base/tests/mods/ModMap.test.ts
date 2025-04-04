import {
    ModDifficultyAdjust,
    ModHardRock,
    ModMap,
    ModReallyEasy,
} from "../../src";

test("Test putting mod into map by key", () => {
    const map = new ModMap();

    map.set(ModReallyEasy);

    expect(map.get(ModReallyEasy)).toBeInstanceOf(ModReallyEasy);
});

test("Test putting mod into map by value", () => {
    const map = new ModMap();

    map.set(new ModReallyEasy());

    expect(map.get(ModReallyEasy)).toBeInstanceOf(ModReallyEasy);
});

test("Test incompatible mod removal", () => {
    const map = new ModMap();

    map.set(ModReallyEasy);
    map.set(ModHardRock);

    expect(map.size).toBe(2);

    map.set(new ModDifficultyAdjust({ cs: 1, ar: 1, od: 1, hp: 1 }));

    expect(map.size).toBe(1);
});
