import { RebalanceMapStars, ModDoubleTime, Parser } from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

const testDiffCalc = async (
    name: string,
    values: Readonly<{
        noModDroidRating: number;
        noModPcRating: number;
        clockRateDroidRating: number;
        clockRatePcRating: number;
    }>
) => {
    const data = await readFile(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" }
    );

    const parser = new Parser().parse(data);

    const rating = new RebalanceMapStars().calculate({
        map: parser.map,
    });

    expect(rating.droidStars.total).toBeCloseTo(values.noModDroidRating, 5);
    expect(rating.pcStars.total).toBeCloseTo(values.noModPcRating, 5);

    const clockRateAdjustedRating = new RebalanceMapStars().calculate({
        map: parser.map,
        mods: [new ModDoubleTime()],
    });

    expect(clockRateAdjustedRating.droidStars.total).toBeCloseTo(
        values.clockRateDroidRating,
        5
    );
    expect(clockRateAdjustedRating.pcStars.total).toBeCloseTo(
        values.clockRatePcRating,
        5
    );
};

test("Test difficulty calculation sample beatmap 1", async () => {
    await testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noModDroidRating: 3.794839733139548,
            noModPcRating: 4.474849928562915,
            clockRateDroidRating: 5.294022080364695,
            clockRatePcRating: 6.2110117507529665,
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: 2.078365063719003,
        noModPcRating: 2.5529341558477285,
        clockRateDroidRating: 2.8898656412104398,
        clockRatePcRating: 3.5316816592043225,
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: 6.223047678094107,
            noModPcRating: 6.236337619017224,
            clockRateDroidRating: 9.211863294064479,
            clockRatePcRating: 9.1018804848952,
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: 4.378711505519505,
        noModPcRating: 7.764128824047393,
        clockRateDroidRating: 6.140578014529187,
        clockRatePcRating: 10.320526252094602,
    });
});
