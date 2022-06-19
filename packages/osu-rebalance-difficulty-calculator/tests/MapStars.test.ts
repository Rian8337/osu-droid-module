import { BeatmapDecoder, ModDoubleTime } from "@rian8337/osu-base";
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

    const rating = new MapStars().calculate({
        map: decoder.result,
    });

    expect(rating.droidStars.aim).toBeCloseTo(values.noModDroidRating.aim, 3);
    expect(rating.droidStars.tap).toBeCloseTo(values.noModDroidRating.tap, 3);
    expect(rating.droidStars.rhythm).toBeCloseTo(
        values.noModDroidRating.rhythm,
        3
    );
    expect(rating.droidStars.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
        3
    );
    expect(rating.droidStars.visual).toBeCloseTo(
        values.noModDroidRating.visual,
        3
    );
    expect(rating.droidStars.total).toBeCloseTo(
        values.noModDroidRating.total,
        4
    );

    expect(rating.pcStars.aim).toBeCloseTo(values.noModPcRating.aim, 3);
    expect(rating.pcStars.speed).toBeCloseTo(values.noModPcRating.speed, 3);
    expect(rating.pcStars.flashlight).toBeCloseTo(
        values.noModPcRating.flashlight,
        3
    );
    expect(rating.pcStars.total).toBeCloseTo(values.noModPcRating.total, 4);

    const clockRateAdjustedRating = new MapStars().calculate({
        map: decoder.result,
        mods: [new ModDoubleTime()],
    });

    expect(clockRateAdjustedRating.droidStars.aim).toBeCloseTo(
        values.clockRateDroidRating.aim,
        3
    );
    expect(clockRateAdjustedRating.droidStars.tap).toBeCloseTo(
        values.clockRateDroidRating.tap,
        3
    );
    expect(clockRateAdjustedRating.droidStars.rhythm).toBeCloseTo(
        values.clockRateDroidRating.rhythm,
        3
    );
    expect(clockRateAdjustedRating.droidStars.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
        3
    );
    expect(clockRateAdjustedRating.droidStars.visual).toBeCloseTo(
        values.clockRateDroidRating.visual,
        3
    );
    expect(clockRateAdjustedRating.droidStars.total).toBeCloseTo(
        values.clockRateDroidRating.total,
        4
    );

    expect(clockRateAdjustedRating.pcStars.aim).toBeCloseTo(
        values.clockRatePcRating.aim,
        3
    );
    expect(clockRateAdjustedRating.pcStars.speed).toBeCloseTo(
        values.clockRatePcRating.speed,
        3
    );
    expect(clockRateAdjustedRating.pcStars.flashlight).toBeCloseTo(
        values.clockRatePcRating.flashlight,
        3
    );
    expect(clockRateAdjustedRating.pcStars.total).toBeCloseTo(
        values.clockRatePcRating.total,
        4
    );
};

test("Test difficulty calculation sample beatmap 1", async () => {
    await testDiffCalc(
        "YOASOBI - Love Letter (ohm002) [Please accept my overflowing emotions.]",
        {
            noModDroidRating: {
                aim: 1.8308299909593841,
                tap: 1.5497945474185437,
                rhythm: 0.8968106940174971,
                flashlight: 0.3355925402880838,
                visual: 1.0903181224402754,
                total: 3.9302232175689453,
            },
            noModPcRating: {
                aim: 2.380333686066187,
                speed: 1.8525518815424369,
                flashlight: 1.5717364749863578,
                total: 4.474849930732708,
            },
            clockRateDroidRating: {
                aim: 2.5921923424607254,
                tap: 2.3102480749491616,
                rhythm: 1.1531543860309408,
                flashlight: 0.6218943593677079,
                visual: 1.322509945546154,
                total: 5.202339559363068,
            },
            clockRatePcRating: {
                aim: 3.26222073103768,
                speed: 2.643760548303716,
                flashlight: 2.5227507731929277,
                total: 6.211011760709198,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9270619986405371,
            tap: 1.0140356501239922,
            rhythm: 0.6495128587880415,
            flashlight: 0.15087366486668538,
            visual: 0.9917812215811896,
            total: 3.1123070319337782,
        },
        noModPcRating: {
            aim: 1.2853681936311694,
            speed: 1.1740787855226908,
            flashlight: 0.49238941370510153,
            total: 2.5604050687408564,
        },
        clockRateDroidRating: {
            aim: 1.2443608411982154,
            tap: 1.4452976582255084,
            rhythm: 0.8684716374159668,
            flashlight: 0.28195291970596936,
            visual: 1.164948800282345,
            total: 3.6504063316578614,
        },
        clockRatePcRating: {
            aim: 1.7277106868093492,
            speed: 1.6780678841141259,
            flashlight: 0.8032282151545147,
            total: 3.537789240286687,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.3001728663225975,
                tap: 3.0546657493916287,
                rhythm: 1.4239803093005992,
                flashlight: 0.833758007614186,
                visual: 1.5028978819794057,
                total: 5.754257869373804,
            },
            noModPcRating: {
                aim: 2.9844158923979682,
                speed: 3.0164501737543654,
                flashlight: 1.9483330438957538,
                total: 6.232100270145301,
            },
            clockRateDroidRating: {
                aim: 3.3570508127576395,
                tap: 4.631461160163305,
                rhythm: 1.6529090173183572,
                flashlight: 1.23443403994121,
                visual: 2.1629871795434763,
                total: 8.341778404008194,
            },
            clockRatePcRating: {
                aim: 4.203173691714608,
                speed: 4.543264147297868,
                flashlight: 3.218542779033249,
                total: 9.09912381223099,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.4937004336287796,
            tap: 1.4362043100177355,
            rhythm: 0.8596924560716204,
            flashlight: 0.4547232694554222,
            visual: 2.5059648022548027,
            total: 5.930155433082136,
        },
        noModPcRating: {
            aim: 4.537924998518297,
            speed: 1.8160213796912776,
            flashlight: 1.811767982796205,
            total: 7.76412829688975,
        },
        clockRateDroidRating: {
            aim: 3.477043133491362,
            tap: 2.0592807288878276,
            rhythm: 1.1051858279903457,
            flashlight: 0.8362048959609906,
            visual: 3.8642011203827953,
            total: 8.009160729197136,
        },
        clockRatePcRating: {
            aim: 6.010075838404166,
            speed: 2.6048378570583806,
            flashlight: 2.964334302911837,
            total: 10.320525934692583,
        },
    });
});
