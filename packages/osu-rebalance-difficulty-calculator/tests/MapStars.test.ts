import { BeatmapDecoder, ModDoubleTime, ModRelax } from "@rian8337/osu-base";
import { MapStars } from "../src/MapStars";
import { readFile } from "fs/promises";
import { join } from "path";

const testDiffCalc = async (
    name: string,
    values: Readonly<{
        noModDroidRating: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            flashlight: number;
            visual: number;
            total: number;
        }>;
        noModPcRating: Readonly<{
            aim: number;
            speed: number;
            flashlight: number;
            total: number;
        }>;
        clockRateDroidRating: Readonly<{
            aim: number;
            tap: number;
            rhythm: number;
            flashlight: number;
            visual: number;
            total: number;
        }>;
        clockRatePcRating: Readonly<{
            aim: number;
            speed: number;
            flashlight: number;
            total: number;
        }>;
    }>
) => {
    const data = await readFile(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" }
    );

    const decoder = new BeatmapDecoder().decode(data);

    const rating = new MapStars(decoder.result);

    // NM droid star rating
    expect(rating.droid.aim).toBeCloseTo(values.noModDroidRating.aim, 3);
    expect(rating.droid.tap).toBeCloseTo(values.noModDroidRating.tap, 3);
    expect(rating.droid.rhythm).toBeCloseTo(values.noModDroidRating.rhythm, 3);
    expect(rating.droid.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
        3
    );
    expect(rating.droid.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
        3
    );
    expect(rating.droid.visual).toBeCloseTo(values.noModDroidRating.visual, 3);
    expect(rating.droid.total).toBeCloseTo(values.noModDroidRating.total, 4);

    // NM PC star rating
    expect(rating.osu.aim).toBeCloseTo(values.noModPcRating.aim, 3);
    expect(rating.osu.speed).toBeCloseTo(values.noModPcRating.speed, 3);
    expect(rating.osu.flashlight).toBeCloseTo(
        values.noModPcRating.flashlight,
        3
    );
    expect(rating.osu.total).toBeCloseTo(values.noModPcRating.total, 4);

    const clockRateAdjustedRating = new MapStars(decoder.result, {
        mods: [new ModDoubleTime()],
    });

    // DT droid star rating
    expect(clockRateAdjustedRating.droid.aim).toBeCloseTo(
        values.clockRateDroidRating.aim,
        3
    );
    clockRateAdjustedRating.droid.calculateAim();
    expect(clockRateAdjustedRating.droid.aim).toBeCloseTo(
        values.clockRateDroidRating.aim,
        3
    );

    expect(clockRateAdjustedRating.droid.tap).toBeCloseTo(
        values.clockRateDroidRating.tap,
        3
    );
    clockRateAdjustedRating.droid.calculateTap();
    expect(clockRateAdjustedRating.droid.tap).toBeCloseTo(
        values.clockRateDroidRating.tap,
        3
    );

    expect(clockRateAdjustedRating.droid.rhythm).toBeCloseTo(
        values.clockRateDroidRating.rhythm,
        3
    );
    clockRateAdjustedRating.droid.calculateRhythm();
    expect(clockRateAdjustedRating.droid.rhythm).toBeCloseTo(
        values.clockRateDroidRating.rhythm,
        3
    );

    expect(clockRateAdjustedRating.droid.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
        3
    );
    clockRateAdjustedRating.droid.calculateFlashlight();
    expect(clockRateAdjustedRating.droid.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
        3
    );

    expect(clockRateAdjustedRating.droid.visual).toBeCloseTo(
        values.clockRateDroidRating.visual,
        3
    );
    clockRateAdjustedRating.droid.calculateVisual();
    expect(clockRateAdjustedRating.droid.visual).toBeCloseTo(
        values.clockRateDroidRating.visual,
        3
    );

    expect(clockRateAdjustedRating.droid.total).toBeCloseTo(
        values.clockRateDroidRating.total,
        4
    );

    // DT PC star rating
    expect(clockRateAdjustedRating.osu.aim).toBeCloseTo(
        values.clockRatePcRating.aim,
        3
    );
    clockRateAdjustedRating.osu.calculateAim();
    expect(clockRateAdjustedRating.osu.aim).toBeCloseTo(
        values.clockRatePcRating.aim,
        3
    );

    expect(clockRateAdjustedRating.osu.speed).toBeCloseTo(
        values.clockRatePcRating.speed,
        3
    );
    clockRateAdjustedRating.osu.calculateSpeed();
    expect(clockRateAdjustedRating.osu.speed).toBeCloseTo(
        values.clockRatePcRating.speed,
        3
    );

    expect(clockRateAdjustedRating.osu.flashlight).toBeCloseTo(
        values.clockRatePcRating.flashlight,
        3
    );
    clockRateAdjustedRating.osu.calculateFlashlight();
    expect(clockRateAdjustedRating.osu.flashlight).toBeCloseTo(
        values.clockRatePcRating.flashlight,
        3
    );

    expect(clockRateAdjustedRating.osu.total).toBeCloseTo(
        values.clockRatePcRating.total,
        4
    );

    // String concatenation test

    const { droid: droidStrRating, osu: osuStrRating } = rating;

    const droidStr = `${droidStrRating.total.toFixed(
        2
    )} stars (${droidStrRating.aim.toFixed(
        2
    )} aim, ${droidStrRating.tap.toFixed(
        2
    )} tap, ${droidStrRating.rhythm.toFixed(
        2
    )} rhythm, ${droidStrRating.flashlight.toFixed(
        2
    )} flashlight, ${droidStrRating.visual.toFixed(2)} visual)`;

    const osuStr = `${osuStrRating.total.toFixed(
        2
    )} stars (${osuStrRating.aim.toFixed(2)} aim, ${osuStrRating.speed.toFixed(
        2
    )} speed, ${osuStrRating.flashlight.toFixed(2)} flashlight)`;

    expect(rating.droid.toString()).toBe(droidStr);
    expect(rating.osu.toString()).toBe(osuStr);
    expect(rating.toString()).toBe(`${droidStr}\n${osuStr}`);

    // Relax speed/tap diffcalc test
    const relaxRating = new MapStars(decoder.result, {
        mods: [new ModRelax()],
    });

    expect(relaxRating.droid.rhythm).toBe(0);
    relaxRating.droid.calculateRhythm();
    expect(relaxRating.droid.rhythm).toBe(0);

    expect(relaxRating.osu.speed).toBe(0);
    relaxRating.osu.calculateSpeed();
    expect(relaxRating.osu.speed).toBe(0);
};

test("Test difficulty calculation sample beatmap 1", async () => {
    await testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noModDroidRating: {
                aim: 1.8937106340402758,
                tap: 1.5497945474185437,
                rhythm: 0.8968106940174971,
                flashlight: 0.37160549782713026,
                visual: 0.8101233971723584,
                total: 3.6726773960949832,
            },
            noModPcRating: {
                aim: 2.3838218888258647,
                speed: 1.8525518815424369,
                flashlight: 1.5783535775012258,
                total: 4.505940065934478,
            },
            clockRateDroidRating: {
                aim: 2.697387261391216,
                tap: 2.3102480749491616,
                rhythm: 1.1531543860309408,
                flashlight: 0.6252487599217125,
                visual: 0.9914125740974973,
                total: 5.071770496431422,
            },
            clockRatePcRating: {
                aim: 3.2635281869753108,
                speed: 2.643760548303716,
                flashlight: 2.4286467982829025,
                total: 6.249438719887609,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9550424043244501,
            tap: 1.0140356501239922,
            rhythm: 0.6495128587880415,
            flashlight: 0.1634611491795005,
            visual: 0.7159820133236695,
            total: 2.600623530855322,
        },
        noModPcRating: {
            aim: 1.2908568104830906,
            speed: 1.1740787855226908,
            flashlight: 0.4965982644504382,
            total: 2.5819090041624486,
        },
        clockRateDroidRating: {
            aim: 1.2820533972192238,
            tap: 1.4452976582255084,
            rhythm: 0.8684716374159668,
            flashlight: 0.2715270182180062,
            visual: 0.8390202476189315,
            total: 3.1785233189341033,
        },
        clockRatePcRating: {
            aim: 1.7354839814844165,
            speed: 1.6780678841141259,
            flashlight: 0.7254798019954478,
            total: 3.5671438626670433,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.3612081210228646,
                tap: 3.0546657493916287,
                rhythm: 1.4239803093005992,
                flashlight: 0.9490610757960627,
                visual: 1.0896897745920069,
                total: 5.529057573912858,
            },
            noModPcRating: {
                aim: 2.999322964576116,
                speed: 3.0164501737543654,
                flashlight: 1.9758596785346605,
                total: 6.284400524147425,
            },
            clockRateDroidRating: {
                aim: 3.4406833690752943,
                tap: 4.631461160163305,
                rhythm: 1.6529090173183572,
                flashlight: 1.4147318326587803,
                visual: 1.6807946629048813,
                total: 8.181838116109049,
            },
            clockRatePcRating: {
                aim: 4.221180552801728,
                speed: 4.543264147297868,
                flashlight: 2.953462028303145,
                total: 9.170095020246256,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.4127064787746852,
            tap: 1.4362043100177355,
            rhythm: 0.8596924560716204,
            flashlight: 1.1704185911400287,
            visual: 1.9628197066343593,
            total: 5.1686830296489585,
        },
        noModPcRating: {
            aim: 4.4331801158225765,
            speed: 1.8160213796912776,
            flashlight: 2.828007311043975,
            total: 7.638354833794094,
        },
        clockRateDroidRating: {
            aim: 3.361342134807172,
            tap: 2.0592807288878276,
            rhythm: 1.1051858279903457,
            flashlight: 1.5019185663660664,
            visual: 3.0633041000919823,
            total: 7.054717043919047,
        },
        clockRatePcRating: {
            aim: 5.866277249054482,
            speed: 2.6048378570583806,
            flashlight: 3.689875513160046,
            total: 10.148293286283412,
        },
    });
});

test("Test difficulty calculation sample beatmap 5", async () => {
    await testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noModDroidRating: {
                aim: 58.544217614822806,
                tap: 5.143249153098792,
                rhythm: 0.6681138931617763,
                flashlight: 46.61927495323293,
                visual: 3.061511553096768,
                total: 91.2904195586622,
            },
            noModPcRating: {
                aim: 16.043384642499753,
                speed: 11.00140070367911,
                flashlight: 361.9636098400294,
                total: 29.33821693274539,
            },
            clockRateDroidRating: {
                aim: 73.7322143252105,
                tap: 7.632874530309652,
                rhythm: 0.718279203893433,
                flashlight: 55.3465989238508,
                visual: 6.2991186135141755,
                total: 114.9817805273222,
            },
            clockRatePcRating: {
                aim: 53.358097235057585,
                speed: 13.206819579506805,
                flashlight: 67.13734923988562,
                total: 90.6507656178002,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 6", async () => {
    await testDiffCalc("negativeOD", {
        noModDroidRating: {
            aim: 0.00005558648801559708,
            tap: 0.18279086410430911,
            rhythm: 0,
            flashlight: 0,
            visual: 0.15588457268119893,
            total: 0.9050895265457967,
        },
        noModPcRating: {
            aim: 0,
            speed: 0.06990556852804106,
            flashlight: 0,
            total: 0.1437742937317235,
        },
        clockRateDroidRating: {
            aim: 0.00006807926611577256,
            tap: 0.22387217334898948,
            rhythm: 0,
            flashlight: 0,
            visual: 0.15588457268119893,
            total: 0.9088348666052912,
        },
        clockRatePcRating: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16732167597199432,
        },
    });
});
