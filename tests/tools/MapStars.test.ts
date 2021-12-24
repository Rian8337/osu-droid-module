import { MapStars, ModDoubleTime, Parser } from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

const testDiffCalc = async (name: string, values: Readonly<{ noModDroidRating: number; noModPcRating: number; clockRateDroidRating: number; clockRatePcRating: number; }>) => {
    const data = await readFile(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" }
    );

    const parser = new Parser().parse(data);

    const rating = new MapStars().calculate({
        map: parser.map,
    });

    expect(rating.droidStars.total).toBeCloseTo(values.noModDroidRating, 5);
    expect(rating.pcStars.total).toBeCloseTo(values.noModPcRating, 5);

    const clockRateAdjustedRating = new MapStars().calculate({
        map: parser.map,
        mods: [new ModDoubleTime()],
    });

    expect(clockRateAdjustedRating.droidStars.total).toBeCloseTo(values.clockRateDroidRating, 5);
    expect(clockRateAdjustedRating.pcStars.total).toBeCloseTo(values.clockRatePcRating, 5);
};

test("Test difficulty calculation sample beatmap 1", async () => {
    await testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noModDroidRating: 3.799928253598726,
            noModPcRating: 4.522893533799243,
            clockRateDroidRating: 5.295554844389063,
            clockRatePcRating: 6.285384944300246,
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc(
        "Kenji Ninuma - DISCOPRINCE (peppy) [Normal]",
        {
            noModDroidRating: 2.0936361160076897,
            noModPcRating: 2.570223819311246,
            clockRateDroidRating: 2.9093851966230346,
            clockRatePcRating: 3.5574696898762754,
        }
    );
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: 6.223099365014345,
            noModPcRating: 6.2401695906695585,
            clockRateDroidRating: 9.2118647592468,
            clockRatePcRating: 9.107840877656399,
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc(
        "Ocelot - KAEDE (Hollow Wings) [EX EX]",
        {
            noModDroidRating: 4.383938283185546,
            noModPcRating: 7.7798062104458,
            clockRateDroidRating: 6.141392181000994,
            clockRatePcRating: 10.344659298946928,
        }
    );
});