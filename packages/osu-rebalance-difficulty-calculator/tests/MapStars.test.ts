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

    expect(rating.droid.attributes.aimDifficulty).toBeCloseTo(
        rating.droid.aim,
        5
    );
    expect(rating.droid.attributes.tapDifficulty).toBeCloseTo(
        rating.droid.tap,
        5
    );
    expect(rating.droid.attributes.rhythmDifficulty).toBeCloseTo(
        rating.droid.rhythm,
        5
    );
    expect(rating.droid.attributes.flashlightDifficulty).toBeCloseTo(
        rating.droid.flashlight,
        5
    );
    expect(rating.droid.attributes.visualDifficulty).toBeCloseTo(
        rating.droid.visual,
        5
    );

    // NM PC star rating
    expect(rating.osu.aim).toBeCloseTo(values.noModPcRating.aim, 3);
    expect(rating.osu.speed).toBeCloseTo(values.noModPcRating.speed, 3);
    expect(rating.osu.flashlight).toBeCloseTo(
        values.noModPcRating.flashlight,
        3
    );
    expect(rating.osu.total).toBeCloseTo(values.noModPcRating.total, 4);

    expect(rating.osu.attributes.aimDifficulty).toBeCloseTo(rating.osu.aim, 5);
    expect(rating.osu.attributes.speedDifficulty).toBeCloseTo(
        rating.osu.speed,
        5
    );
    expect(rating.osu.attributes.flashlightDifficulty).toBeCloseTo(
        rating.osu.flashlight,
        5
    );

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

    expect(clockRateAdjustedRating.droid.attributes.aimDifficulty).toBeCloseTo(
        clockRateAdjustedRating.droid.aim,
        5
    );
    expect(clockRateAdjustedRating.droid.attributes.tapDifficulty).toBeCloseTo(
        clockRateAdjustedRating.droid.tap,
        5
    );
    expect(
        clockRateAdjustedRating.droid.attributes.rhythmDifficulty
    ).toBeCloseTo(clockRateAdjustedRating.droid.rhythm, 5);
    expect(
        clockRateAdjustedRating.droid.attributes.flashlightDifficulty
    ).toBeCloseTo(clockRateAdjustedRating.droid.flashlight, 5);
    expect(
        clockRateAdjustedRating.droid.attributes.visualDifficulty
    ).toBeCloseTo(clockRateAdjustedRating.droid.visual, 5);

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

    expect(clockRateAdjustedRating.osu.attributes.aimDifficulty).toBeCloseTo(
        clockRateAdjustedRating.osu.aim,
        5
    );
    expect(clockRateAdjustedRating.osu.attributes.speedDifficulty).toBeCloseTo(
        clockRateAdjustedRating.osu.speed,
        5
    );
    expect(
        clockRateAdjustedRating.osu.attributes.flashlightDifficulty
    ).toBeCloseTo(clockRateAdjustedRating.osu.flashlight, 5);

    const { noModDroidRating: droidStrRating, noModPcRating: osuStrRating } =
        values;

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

    expect(relaxRating.droid.tap).toBe(0);
    relaxRating.droid.calculateTap();
    expect(relaxRating.droid.tap).toBe(0);

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
                aim: 1.9592932112846122,
                tap: 1.5297313394448144,
                rhythm: 0.8914153396274211,
                flashlight: 0.38532645430626666,
                visual: 0.7977472576520745,
                total: 3.662153219734347,
            },
            noModPcRating: {
                aim: 2.3838218888258647,
                speed: 1.8525518815424369,
                flashlight: 1.5645506842678976,
                total: 4.505940065934478,
            },
            clockRateDroidRating: {
                aim: 2.778554880321739,
                tap: 2.272025971813077,
                rhythm: 1.1467786666588318,
                flashlight: 0.6473871469148181,
                visual: 0.9479029047221431,
                total: 4.8084076811585525,
            },
            clockRatePcRating: {
                aim: 3.2635281869753108,
                speed: 2.643760548303716,
                flashlight: 2.4178869049490412,
                total: 6.249438719887609,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9951583413368227,
            tap: 1.0050733912780205,
            rhythm: 0.6472678620060646,
            flashlight: 0.17757869268053578,
            visual: 0.698701552668593,
            total: 2.7739922728884925,
        },
        noModPcRating: {
            aim: 1.2908568104830906,
            speed: 1.1740787855226908,
            flashlight: 0.4553605941977207,
            total: 2.5819090041624486,
        },
        clockRateDroidRating: {
            aim: 1.3328142546393114,
            tap: 1.4280939468519143,
            rhythm: 0.8659416219284156,
            flashlight: 0.2930573992261987,
            visual: 0.7961683862634985,
            total: 3.2732991954012123,
        },
        clockRatePcRating: {
            aim: 1.7354839814844165,
            speed: 1.6780678841141259,
            flashlight: 0.6665049121309409,
            total: 3.5671438626670433,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.4284331251140285,
                tap: 2.9990357991419816,
                rhythm: 1.405878591040392,
                flashlight: 1.0610817679095388,
                visual: 0.9045624484382072,
                total: 5.423574345111293,
            },
            noModPcRating: {
                aim: 2.999322964576116,
                speed: 3.0164501737543654,
                flashlight: 1.9501085717169278,
                total: 6.284400524147425,
            },
            clockRateDroidRating: {
                aim: 3.5335220146480264,
                tap: 4.49910821095138,
                rhythm: 1.632988701570522,
                flashlight: 1.5816882613337735,
                visual: 1.362637970062681,
                total: 7.861320203403726,
            },
            clockRatePcRating: {
                aim: 4.221180552801728,
                speed: 4.543264147297868,
                flashlight: 2.908633536037269,
                total: 9.170095020246256,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.513376668511267,
            tap: 1.4309370171606859,
            rhythm: 0.8576740254440206,
            flashlight: 1.3072251462861515,
            visual: 1.9495901463960355,
            total: 4.852410305820138,
        },
        noModPcRating: {
            aim: 4.4331801158225765,
            speed: 1.8160213796912776,
            flashlight: 2.861312339427562,
            total: 7.638354833794094,
        },
        clockRateDroidRating: {
            aim: 3.502889477827892,
            tap: 2.0498666584053264,
            rhythm: 1.103613420857146,
            flashlight: 1.67656733832041,
            visual: 3.0127439163977248,
            total: 6.251305620978158,
        },
        clockRatePcRating: {
            aim: 5.866277249054482,
            speed: 2.6048378570583806,
            flashlight: 3.725475841965342,
            total: 10.148293286283412,
        },
    });
});

test("Test difficulty calculation sample beatmap 5", async () => {
    await testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noModDroidRating: {
                aim: 59.80314173580019,
                tap: 5.006105552214093,
                rhythm: 0.6681138931617763,
                flashlight: 52.059725422118845,
                visual: 1.7997869459845357,
                total: 42.85219486370555,
            },
            noModPcRating: {
                aim: 16.043384642499753,
                speed: 11.00140070367911,
                flashlight: 111.70041832492731,
                total: 29.33821693274539,
            },
            clockRateDroidRating: {
                aim: 75.32004598349347,
                tap: 7.4413497890329445,
                rhythm: 0.718279203893433,
                flashlight: 61.9362029775972,
                visual: 5.220345852535436,
                total: 51.612662817831904,
            },
            clockRatePcRating: {
                aim: 53.358097235057585,
                speed: 13.206819579506805,
                flashlight: 44.18671236871769,
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
            total: 1.173713076243498,
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
            total: 1.175931397729203,
        },
        clockRatePcRating: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16732167597199432,
        },
    });
});
