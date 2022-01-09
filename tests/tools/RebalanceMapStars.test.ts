import { RebalanceMapStars, ModDoubleTime, Parser } from "../../src";
import { readFile } from "fs/promises";
import { join } from "path";

const testDiffCalc = async (
    name: string,
    values: Readonly<{
        noModDroidRating: Readonly<{
            aim: number;
            tap: number;
            flashlight: number;
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
            flashlight: number;
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

    const parser = new Parser().parse(data);

    const rating = new RebalanceMapStars().calculate({
        map: parser.map,
    });

    expect(rating.droidStars.aim).toBeCloseTo(values.noModDroidRating.aim, 3);
    expect(rating.droidStars.tap).toBeCloseTo(values.noModDroidRating.tap, 3);
    expect(rating.droidStars.flashlight).toBeCloseTo(
        values.noModDroidRating.flashlight,
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

    const clockRateAdjustedRating = new RebalanceMapStars().calculate({
        map: parser.map,
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
    expect(clockRateAdjustedRating.droidStars.flashlight).toBeCloseTo(
        values.clockRateDroidRating.flashlight,
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
                aim: 2.02939979795515,
                tap: 1.5982095799699558,
                flashlight: 0.24456120234814863,
                total: 3.8291723540379516,
            },
            noModPcRating: {
                aim: 2.380333686066187,
                speed: 1.8525518815424369,
                flashlight: 1.4428426705449113,
                total: 4.474849930732708,
            },
            clockRateDroidRating: {
                aim: 2.825276908106492,
                tap: 2.3303131834906146,
                flashlight: 0.4073993190774762,
                total: 5.41133471882864,
            },
            clockRatePcRating: {
                aim: 3.26222073103768,
                speed: 2.643760548303716,
                flashlight: 2.1321135768510024,
                total: 6.211011760709198,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 0.9798373149240929,
            tap: 1.0689579181543156,
            flashlight: 0.11137810944618322,
            total: 2.1325456258492532,
        },
        noModPcRating: {
            aim: 1.2853681936311694,
            speed: 1.1740787855226908,
            flashlight: 0.4651445272367601,
            total: 2.5604050687408564,
        },
        clockRateDroidRating: {
            aim: 1.3195263091903684,
            tap: 1.5556229751458068,
            flashlight: 0.1847324852220605,
            total: 3.0096741939432143,
        },
        clockRatePcRating: {
            aim: 1.7277106868093492,
            speed: 1.6780678841141259,
            flashlight: 0.6788517515764375,
            total: 3.537789240286687,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.3953211346822942,
                tap: 3.6876037968858633,
                flashlight: 0.5671860188989748,
                total: 6.632567638612947,
            },
            noModPcRating: {
                aim: 2.9844158923979682,
                speed: 3.020477106695645,
                flashlight: 1.84999959174519,
                total: 6.236337650265726,
            },
            clockRateDroidRating: {
                aim: 3.487517365342624,
                tap: 5.4862830644673775,
                flashlight: 0.8460822622701135,
                total: 9.825550094984496,
            },
            clockRatePcRating: {
                aim: 4.203173691714608,
                speed: 4.545702335809381,
                flashlight: 2.720165146136031,
                total: 9.101880528832664,
            },
        }
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 2.4787385216640407,
            tap: 1.4932418816734367,
            flashlight: 0.3314714347245659,
            total: 4.402894869797919,
        },
        noModPcRating: {
            aim: 4.537924998518297,
            speed: 1.8160213796912776,
            flashlight: 1.7005672452023597,
            total: 7.76412829688975,
        },
        clockRateDroidRating: {
            aim: 3.4686482652957387,
            tap: 2.1492899244358465,
            flashlight: 0.5440515212983436,
            total: 6.1865991261322435,
        },
        clockRatePcRating: {
            aim: 6.010075838404166,
            speed: 2.6048378570583806,
            flashlight: 2.5053196732397875,
            total: 10.320525934692583,
        },
    });
});
