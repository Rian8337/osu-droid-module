import {
    ModDifficultyAdjust,
    ModHardRock,
    ModMap,
    ModReallyEasy,
    ModReplayV6,
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

test("Test equals", () => {
    const map1 = new ModMap();
    const map2 = new ModMap();

    map1.set(ModReallyEasy);
    map2.set(ModReallyEasy);

    expect(map1.equals(map2)).toBe(true);

    map1.set(ModHardRock);
    map2.set(new ModHardRock());

    expect(map1.equals(map2)).toBe(true);

    map1.set(new ModDifficultyAdjust({ cs: 1, ar: 1, od: 1, hp: 1 }));
    map2.set(new ModDifficultyAdjust({ cs: 1, ar: 1, od: 1, hp: 1 }));

    expect(map1.equals(map2)).toBe(true);

    map2.set(new ModDifficultyAdjust({ cs: 2, ar: 2, od: 2, hp: 2 }));

    expect(map1.equals(map2)).toBe(false);
});

test("Test toString", () => {
    const map = new ModMap();

    map.set(ModReallyEasy);
    map.set(ModHardRock);

    expect(map.toString()).toBe("HR,RE");

    map.set(new ModDifficultyAdjust({ cs: 1, ar: 1, od: 1, hp: 1 }));

    expect(map.toString()).toBe("DA (CS1.0, AR1.0, OD1.0, HP1.0)");

    map.set(ModReplayV6);

    expect(map.toString()).toBe("DA (CS1.0, AR1.0, OD1.0, HP1.0),RV6");
    expect(map.toString(false)).toBe("DA (CS1.0, AR1.0, OD1.0, HP1.0)");
});
