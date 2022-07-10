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
                aim: 1.8295910280371157,
                tap: 1.5133006978671943,
                rhythm: 0.8968106940174971,
                flashlight: 0.3355925402880838,
                visual: 1.0903181224402754,
                total: 3.9114283389689684,
            },
            noModPcRating: {
                aim: 2.380333686066187,
                speed: 1.9081966791619958,
                flashlight: 1.469925865780847,
                total: 4.516294389592336,
            },
            clockRateDroidRating: {
                aim: 2.590043298514958,
                tap: 2.1998871190827574,
                rhythm: 1.1531543860309408,
                flashlight: 0.6218943593677079,
                visual: 1.322509945546154,
                total: 5.130102483935239,
            },
            clockRatePcRating: {
                aim: 3.26222073103768,
                speed: 2.7347306645944975,
                flashlight: 2.1848608772021496,
                total: 6.283680696383357,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9270619986405371,
            tap: 1.0130903153652016,
            rhythm: 0.6495128587880415,
            flashlight: 0.15087366486668538,
            visual: 0.9917812215811896,
            total: 3.11194588764068,
        },
        noModPcRating: {
            aim: 1.2853681936311694,
            speed: 1.1776242355913606,
            flashlight: 0.44268742767870073,
            total: 2.563685990010083,
        },
        clockRateDroidRating: {
            aim: 1.2443608411982154,
            tap: 1.4435941001796837,
            rhythm: 0.8684716374159668,
            flashlight: 0.28195291970596936,
            visual: 1.164948800282345,
            total: 3.6495658854823554,
        },
        clockRatePcRating: {
            aim: 1.7277106868093492,
            speed: 1.683686005899145,
            flashlight: 0.6421943981100025,
            total: 3.5434319862501202,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.295171707414334,
                tap: 3.0590572602295913,
                rhythm: 1.4239803093005992,
                flashlight: 0.833758007614186,
                visual: 1.5028978819794057,
                total: 5.756112725566178,
            },
            noModPcRating: {
                aim: 2.9844158923979682,
                speed: 3.0232169527379598,
                flashlight: 2.116873738481202,
                total: 6.239224371561388,
            },
            clockRateDroidRating: {
                aim: 3.348466390587024,
                tap: 4.622568937726299,
                rhythm: 1.6529090173183572,
                flashlight: 1.23443403994121,
                visual: 2.1629871795434763,
                total: 8.32732035614827,
            },
            clockRatePcRating: {
                aim: 4.203173691714608,
                speed: 4.5509547769922465,
                flashlight: 3.100406564705179,
                total: 9.10782416909572,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.413178874945639,
            tap: 1.4362043100177355,
            rhythm: 0.8596924560716204,
            flashlight: 0.4547232694554222,
            visual: 2.5059648022548027,
            total: 5.884451476603233,
        },
        noModPcRating: {
            aim: 4.537924998518297,
            speed: 1.87761310526086,
            flashlight: 1.7350966585210856,
            total: 7.77631129957478,
        },
        clockRateDroidRating: {
            aim: 3.360491614242885,
            tap: 2.0587703986545245,
            rhythm: 1.1051858279903457,
            flashlight: 0.8362048959609906,
            visual: 3.8642011203827953,
            total: 7.937599004969928,
        },
        clockRatePcRating: {
            aim: 6.010075838404166,
            speed: 2.704738611644462,
            flashlight: 2.554535665503798,
            total: 10.344466173510687,
        },
    });
});
