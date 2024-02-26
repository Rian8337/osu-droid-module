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
    }>,
) => {
    const data = await readFile(
        join(process.cwd(), "tests", "files", "beatmaps", `${name}.osu`),
        { encoding: "utf-8" },
    );

    const decoder = new BeatmapDecoder().decode(data);

    const rating = new MapStars(decoder.result);

    // NM droid star rating
    expect(rating.droid.aim).toBeCloseTo(values.noModDroidRating.aim, 5);
    expect(rating.droid.tap).toBeCloseTo(values.noModDroidRating.tap, 5);
    expect(rating.droid.rhythm).toBeCloseTo(values.noModDroidRating.rhythm, 5);
    expect(rating.droid.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
        5,
    );
    expect(rating.droid.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
        5,
    );
    expect(rating.droid.visual).toBeCloseTo(values.noModDroidRating.visual, 5);
    expect(rating.droid.total).toBeCloseTo(values.noModDroidRating.total, 6);

    expect(rating.droid.attributes.aimDifficulty).toBeCloseTo(
        rating.droid.aim,
        5,
    );
    expect(rating.droid.attributes.tapDifficulty).toBeCloseTo(
        rating.droid.tap,
        5,
    );
    expect(rating.droid.attributes.rhythmDifficulty).toBeCloseTo(
        rating.droid.rhythm,
        5,
    );
    expect(rating.droid.attributes.flashlightDifficulty).toBeCloseTo(
        rating.droid.flashlight,
        5,
    );
    expect(rating.droid.attributes.visualDifficulty).toBeCloseTo(
        rating.droid.visual,
        5,
    );

    // NM PC star rating
    expect(rating.osu.aim).toBeCloseTo(values.noModPcRating.aim, 5);
    expect(rating.osu.speed).toBeCloseTo(values.noModPcRating.speed, 5);
    expect(rating.osu.flashlight).toBeCloseTo(
        values.noModPcRating.flashlight,
        5,
    );
    expect(rating.osu.total).toBeCloseTo(values.noModPcRating.total, 5);

    expect(rating.osu.attributes.aimDifficulty).toBeCloseTo(rating.osu.aim, 5);
    expect(rating.osu.attributes.speedDifficulty).toBeCloseTo(
        rating.osu.speed,
        5,
    );
    expect(rating.osu.attributes.flashlightDifficulty).toBeCloseTo(
        rating.osu.flashlight,
        5,
    );

    const clockRateAdjustedRating = new MapStars(decoder.result, {
        mods: [new ModDoubleTime()],
    });

    // DT droid star rating
    expect(clockRateAdjustedRating.droid.aim).toBeCloseTo(
        values.clockRateDroidRating.aim,
        5,
    );
    clockRateAdjustedRating.droid.calculateAim();
    expect(clockRateAdjustedRating.droid.aim).toBeCloseTo(
        values.clockRateDroidRating.aim,
        5,
    );

    expect(clockRateAdjustedRating.droid.tap).toBeCloseTo(
        values.clockRateDroidRating.tap,
        5,
    );
    clockRateAdjustedRating.droid.calculateTap();
    expect(clockRateAdjustedRating.droid.tap).toBeCloseTo(
        values.clockRateDroidRating.tap,
        5,
    );

    expect(clockRateAdjustedRating.droid.rhythm).toBeCloseTo(
        values.clockRateDroidRating.rhythm,
        5,
    );
    clockRateAdjustedRating.droid.calculateRhythm();
    expect(clockRateAdjustedRating.droid.rhythm).toBeCloseTo(
        values.clockRateDroidRating.rhythm,
        5,
    );

    expect(clockRateAdjustedRating.droid.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
        5,
    );
    clockRateAdjustedRating.droid.calculateFlashlight();
    expect(clockRateAdjustedRating.droid.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
        5,
    );

    expect(clockRateAdjustedRating.droid.visual).toBeCloseTo(
        values.clockRateDroidRating.visual,
        5,
    );
    clockRateAdjustedRating.droid.calculateVisual();
    expect(clockRateAdjustedRating.droid.visual).toBeCloseTo(
        values.clockRateDroidRating.visual,
        5,
    );

    expect(clockRateAdjustedRating.droid.total).toBeCloseTo(
        values.clockRateDroidRating.total,
        5,
    );

    expect(clockRateAdjustedRating.droid.attributes.aimDifficulty).toBeCloseTo(
        clockRateAdjustedRating.droid.aim,
        5,
    );
    expect(clockRateAdjustedRating.droid.attributes.tapDifficulty).toBeCloseTo(
        clockRateAdjustedRating.droid.tap,
        5,
    );
    expect(
        clockRateAdjustedRating.droid.attributes.rhythmDifficulty,
    ).toBeCloseTo(clockRateAdjustedRating.droid.rhythm, 5);
    expect(
        clockRateAdjustedRating.droid.attributes.flashlightDifficulty,
    ).toBeCloseTo(clockRateAdjustedRating.droid.flashlight, 5);
    expect(
        clockRateAdjustedRating.droid.attributes.visualDifficulty,
    ).toBeCloseTo(clockRateAdjustedRating.droid.visual, 5);

    // DT PC star rating
    expect(clockRateAdjustedRating.osu.aim).toBeCloseTo(
        values.clockRatePcRating.aim,
        5,
    );
    clockRateAdjustedRating.osu.calculateAim();
    expect(clockRateAdjustedRating.osu.aim).toBeCloseTo(
        values.clockRatePcRating.aim,
        5,
    );

    expect(clockRateAdjustedRating.osu.speed).toBeCloseTo(
        values.clockRatePcRating.speed,
        5,
    );
    clockRateAdjustedRating.osu.calculateSpeed();
    expect(clockRateAdjustedRating.osu.speed).toBeCloseTo(
        values.clockRatePcRating.speed,
        5,
    );

    expect(clockRateAdjustedRating.osu.flashlight).toBeCloseTo(
        values.clockRatePcRating.flashlight,
        5,
    );
    clockRateAdjustedRating.osu.calculateFlashlight();
    expect(clockRateAdjustedRating.osu.flashlight).toBeCloseTo(
        values.clockRatePcRating.flashlight,
        5,
    );

    expect(clockRateAdjustedRating.osu.total).toBeCloseTo(
        values.clockRatePcRating.total,
        5,
    );

    expect(clockRateAdjustedRating.osu.attributes.aimDifficulty).toBeCloseTo(
        clockRateAdjustedRating.osu.aim,
        5,
    );
    expect(clockRateAdjustedRating.osu.attributes.speedDifficulty).toBeCloseTo(
        clockRateAdjustedRating.osu.speed,
        5,
    );
    expect(
        clockRateAdjustedRating.osu.attributes.flashlightDifficulty,
    ).toBeCloseTo(clockRateAdjustedRating.osu.flashlight, 5);

    const { noModDroidRating: droidStrRating, noModPcRating: osuStrRating } =
        values;

    const droidStr = `${droidStrRating.total.toFixed(
        2,
    )} stars (${droidStrRating.aim.toFixed(
        2,
    )} aim, ${droidStrRating.tap.toFixed(
        2,
    )} tap, ${droidStrRating.rhythm.toFixed(
        2,
    )} rhythm, ${droidStrRating.flashlight.toFixed(
        2,
    )} flashlight, ${droidStrRating.visual.toFixed(2)} visual)`;

    const osuStr = `${osuStrRating.total.toFixed(
        2,
    )} stars (${osuStrRating.aim.toFixed(2)} aim, ${osuStrRating.speed.toFixed(
        2,
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
                aim: 2.481342402872617,
                tap: 1.4997744292829895,
                rhythm: 0.8775324539140502,
                flashlight: 1.512919583426264,
                visual: 0.7893928912685754,
                total: 3.98717594152271,
            },
            noModPcRating: {
                aim: 2.38329754243596,
                speed: 1.852444804914802,
                flashlight: 1.5634530448756425,
                total: 4.50516851110435,
            },
            clockRateDroidRating: {
                aim: 3.3902923371220384,
                tap: 2.1836296933331045,
                rhythm: 1.061749550191306,
                flashlight: 2.048936199513036,
                visual: 0.9411987741403649,
                total: 5.120773994997568,
            },
            clockRatePcRating: {
                aim: 3.2627995309721967,
                speed: 2.643610266224992,
                flashlight: 2.416522950209294,
                total: 6.2483878561131405,
            },
        },
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 1.1993002538352076,
            tap: 1.0006709597268135,
            rhythm: 0.6432345193454881,
            flashlight: 0.5631552486945719,
            visual: 0.8113083222620587,
            total: 3.0008390386539974,
        },
        noModPcRating: {
            aim: 1.2905674764533197,
            speed: 1.1738140594624356,
            flashlight: 0.4549452241175434,
            total: 2.581328909130559,
        },
        clockRateDroidRating: {
            aim: 1.6351037770761043,
            tap: 1.407530447303691,
            rhythm: 0.8216298705157962,
            flashlight: 0.7596492430538412,
            visual: 0.9702315322794475,
            total: 3.5661199727349775,
        },
        clockRatePcRating: {
            aim: 1.735080364763565,
            speed: 1.6776992711424359,
            flashlight: 0.6658612072738427,
            total: 3.5663359644015125,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.933970670089375,
                tap: 3.176599290019633,
                rhythm: 1.384266453689203,
                flashlight: 1.7994540310437923,
                visual: 0.9593772706131719,
                total: 5.847132947713061,
            },
            noModPcRating: {
                aim: 2.998699808952236,
                speed: 3.0163495021546853,
                flashlight: 1.9493277808469929,
                total: 6.28364808504362,
            },
            clockRateDroidRating: {
                aim: 4.080256938754935,
                tap: 4.354213960888814,
                rhythm: 1.5415612896827433,
                flashlight: 2.4763430872752648,
                visual: 1.0879361824589315,
                total: 7.786047438336179,
            },
            clockRatePcRating: {
                aim: 4.220274465297037,
                speed: 4.543127503929168,
                flashlight: 2.9074624323391167,
                total: 9.169076094166597,
            },
        },
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 3.083735004650295,
            tap: 1.4273929472848053,
            rhythm: 0.8279224718488427,
            flashlight: 3.036732227434069,
            visual: 2.9106702575490333,
            total: 5.826894807950515,
        },
        noModPcRating: {
            aim: 4.43027816349069,
            speed: 1.8158495987631025,
            flashlight: 2.8603654043070934,
            total: 7.6335688890847075,
        },
        clockRateDroidRating: {
            aim: 4.296575712713009,
            tap: 2.03038057135962,
            rhythm: 1.0127723646589712,
            flashlight: 3.6581422915220663,
            visual: 3.827435982292227,
            total: 7.085931283319675,
        },
        clockRatePcRating: {
            aim: 5.8625331362421,
            speed: 2.604564024638431,
            flashlight: 3.7242470586790755,
            total: 10.142162546734784,
        },
    });
});

test("Test difficulty calculation sample beatmap 5", async () => {
    await testDiffCalc(
        "m1dlet - Tell Me Why Speedcore Is So Awesome (None1637) [DROID Ultimate PP CS32 x2]",
        {
            noModDroidRating: {
                aim: 60.424834820878615,
                tap: 5.1903726491946625,
                rhythm: 0.6421118550985445,
                flashlight: 74.08756345759954,
                visual: 1.8347169444156775,
                total: 43.213189769136214,
            },
            noModPcRating: {
                aim: 16.04102965680953,
                speed: 11.00140070367911,
                flashlight: 111.66679764219036,
                total: 29.334871129605816,
            },
            clockRateDroidRating: {
                aim: 76.07140986378113,
                tap: 7.0112110684502404,
                rhythm: 0.6558919035917352,
                flashlight: 73.47134953680339,
                visual: 2.2617956952114926,
                total: 51.98205512215614,
            },
            clockRatePcRating: {
                aim: 20.38661513206168,
                speed: 13.198324389756989,
                flashlight: 126.07681557521249,
                total: 36.83801094932713,
            },
        },
    );
});

test("Test difficulty calculation sample beatmap 6", async () => {
    await testDiffCalc("negativeOD", {
        noModDroidRating: {
            aim: 0.001479378256495523,
            tap: 0.18279086410430911,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.31681941056355756,
        },
        noModPcRating: {
            aim: 0,
            speed: 0.06990556852804106,
            flashlight: 0,
            total: 0.1437742937317235,
        },
        clockRateDroidRating: {
            aim: 0.0018118609324911225,
            tap: 0.22387217334898948,
            rhythm: 0,
            flashlight: 0,
            visual: 0,
            total: 0.3833987248977269,
        },
        clockRatePcRating: {
            aim: 0,
            speed: 0.08561648653643154,
            flashlight: 0,
            total: 0.16732167597199432,
        },
    });
});
