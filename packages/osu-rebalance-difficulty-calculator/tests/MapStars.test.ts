import { ModDoubleTime, Parser } from "@rian8337/osu-base";
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

    const parser = new Parser().parse(data);

    const rating = new MapStars().calculate({
        map: parser.map,
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
                aim: 1.8295910280371157,
                tap: 1.5133006978671943,
                rhythm: 0.8968106940174971,
                flashlight: 0.3303826509216345,
                visual: 1.1081758765847338,
                total: 4.088285631960311,
            },
            noModPcRating: {
                aim: 2.380333686066187,
                speed: 1.8525518815424369,
                flashlight: 1.4428426705449113,
                total: 4.474849930732708,
            },
            clockRateDroidRating: {
                aim: 2.590043298514958,
                tap: 2.1998871190827574,
                rhythm: 1.1531543860309408,
                flashlight: 0.5440442337021129,
                visual: 1.3398005600735878,
                total: 5.348421304293565,
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
            aim: 0.9270619986405371,
            tap: 1.0130903153652016,
            rhythm: 0.6478989372640993,
            flashlight: 0.1493968948252234,
            visual: 0.9717155712030804,
            total: 3.2014807664160845,
        },
        noModPcRating: {
            aim: 1.2853681936311694,
            speed: 1.1740787855226908,
            flashlight: 0.4651445272367601,
            total: 2.5604050687408564,
        },
        clockRateDroidRating: {
            aim: 1.2443608411982154,
            tap: 1.4435941001796837,
            rhythm: 0.8627236948014744,
            flashlight: 0.24665742313126465,
            visual: 1.1077809912182381,
            total: 3.713202852097645,
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
                aim: 2.295171707414334,
                tap: 3.0590572602295913,
                rhythm: 1.420300795672753,
                flashlight: 0.7295135663142638,
                visual: 1.3931344678532478,
                total: 5.91484614404762,
            },
            noModPcRating: {
                aim: 2.9844158923979682,
                speed: 3.020477106695645,
                flashlight: 1.84999959174519,
                total: 6.236337650265726,
            },
            clockRateDroidRating: {
                aim: 3.348466390587024,
                tap: 4.622568937726299,
                rhythm: 1.6484876063306988,
                flashlight: 1.0799048282065697,
                visual: 1.8995979773098068,
                total: 8.55158894231688,
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
            aim: 2.413178874945639,
            tap: 1.4362043100177355,
            rhythm: 0.8596924560716204,
            flashlight: 0.4427951666970322,
            visual: 2.778992195275126,
            total: 6.442329486372196,
        },
        noModPcRating: {
            aim: 4.537924998518297,
            speed: 1.8160213796912776,
            flashlight: 1.7005672452023597,
            total: 7.76412829688975,
        },
        clockRateDroidRating: {
            aim: 3.360491614242885,
            tap: 2.0587703986545245,
            rhythm: 1.1051858279903457,
            flashlight: 0.7315268984005433,
            visual: 4.498894607605811,
            total: 8.88456034929097,
        },
        clockRatePcRating: {
            aim: 6.010075838404166,
            speed: 2.6048378570583806,
            flashlight: 2.5053196732397875,
            total: 10.320525934692583,
        },
    });
});
