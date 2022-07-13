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
                aim: 1.9176826089844696,
                tap: 1.5497945474185437,
                rhythm: 0.8968106940174971,
                flashlight: 0.37160549782713026,
                visual: 0.9784848586311372,
                total: 3.884490527125545,
            },
            noModPcRating: {
                aim: 2.380333686066187,
                speed: 1.8525518815424369,
                flashlight: 1.5783535775012258,
                total: 4.474849930732708,
            },
            clockRateDroidRating: {
                aim: 2.731532763181477,
                tap: 2.3102480749491616,
                rhythm: 1.1531543860309408,
                flashlight: 0.6252487599217125,
                visual: 1.156529805296646,
                total: 5.223431747913987,
            },
            clockRatePcRating: {
                aim: 3.26222073103768,
                speed: 2.643760548303716,
                flashlight: 2.3298364064749078,
                total: 6.211011760709198,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9671320299386145,
            tap: 1.0140356501239922,
            rhythm: 0.6495128587880415,
            flashlight: 0.1634611491795005,
            visual: 0.8163448142051186,
            total: 2.8312418225567044,
        },
        noModPcRating: {
            aim: 1.2853681936311694,
            speed: 1.1740787855226908,
            flashlight: 0.4965982644504382,
            total: 2.5604050687408564,
        },
        clockRateDroidRating: {
            aim: 1.298282567274465,
            tap: 1.4452976582255084,
            rhythm: 0.8684716374159668,
            flashlight: 0.2715270182180062,
            visual: 0.9541080654338081,
            total: 3.3869768978487813,
        },
        clockRatePcRating: {
            aim: 1.7277106868093492,
            speed: 1.6780678841141259,
            flashlight: 0.7254798019954478,
            total: 3.537789240286687,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.39109802125246,
                tap: 3.0546657493916287,
                rhythm: 1.4239803093005992,
                flashlight: 0.9490610757960627,
                visual: 1.4512997110887267,
                total: 5.770914679967253,
            },
            noModPcRating: {
                aim: 2.9844158923979682,
                speed: 3.0164501737543654,
                flashlight: 1.9758596785346605,
                total: 6.232100270145301,
            },
            clockRateDroidRating: {
                aim: 3.4842380569097315,
                tap: 4.631461160163305,
                rhythm: 1.6529090173183572,
                flashlight: 1.4147318326587803,
                visual: 1.9348775516906391,
                total: 8.322184330078004,
            },
            clockRatePcRating: {
                aim: 4.203173691714608,
                speed: 4.543264147297868,
                flashlight: 2.899673665183888,
                total: 9.09912381223099,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.443248282901055,
            tap: 1.4362043100177355,
            rhythm: 0.8596924560716204,
            flashlight: 0.49340366875435987,
            visual: 1.833573875916148,
            total: 5.161421573099039,
        },
        noModPcRating: {
            aim: 4.537924998518297,
            speed: 1.8160213796912776,
            flashlight: 1.8216253866170895,
            total: 7.76412829688975,
        },
        clockRateDroidRating: {
            aim: 3.4038924632396355,
            tap: 2.0592807288878276,
            rhythm: 1.1051858279903457,
            flashlight: 0.8108433357022212,
            visual: 2.791356326799641,
            total: 6.988632919239544,
        },
        clockRatePcRating: {
            aim: 6.010075838404166,
            speed: 2.6048378570583806,
            flashlight: 2.686768315519511,
            total: 10.320525934692583,
        },
    });
});

test("Test difficulty calculation sample beatmap 5", async () => {
    await testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noModDroidRating: {
                aim: 59.285313161609565,
                tap: 5.143249153098792,
                rhythm: 0.6681138931617763,
                flashlight: 46.6192660407966,
                visual: 3.273118296509982,
                total: 92.44621813561301,
            },
            noModPcRating: {
                aim: 15.940869952847681,
                speed: 11.00140070367911,
                flashlight: 361.9636098400294,
                total: 29.021079915494028,
            },
            clockRateDroidRating: {
                aim: 74.66557064830032,
                tap: 7.632874530309652,
                rhythm: 0.718279203893433,
                flashlight: 55.3465989238508,
                visual: 5.895195542661922,
                total: 116.43563709113414,
            },
            clockRatePcRating: {
                aim: 53.928961866992545,
                speed: 13.206819579506805,
                flashlight: 67.11112620179784,
                total: 91.0721226762261,
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
            total: 0.9334430902618079,
        },
        noModPcRating: {
            aim: 0,
            speed: 0.06990556852804106,
            flashlight: 0,
            total: 0.14292854302435648,
        },
        clockRateDroidRating: {
            aim: 0.00006807926611577256,
            tap: 0.22387217334898948,
            rhythm: 0,
            flashlight: 0,
            visual: 0.15588457268119893,
            total: 0.9369025358419838,
        },
        clockRatePcRating: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16633740804663621,
        },
    });
});
