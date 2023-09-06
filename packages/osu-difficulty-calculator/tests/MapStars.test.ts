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
                aim: 2.541522220629826,
                tap: 1.5133294131030315,
                rhythm: 0.8760170382393014,
                flashlight: 1.5209089774116538,
                visual: 0.7863183770961631,
                total: 4.036195284377704,
            },
            noModPcRating: {
                aim: 2.3838218888258647,
                speed: 1.8525518815424369,
                flashlight: 1.5645506842678976,
                total: 4.505940065934478,
            },
            clockRateDroidRating: {
                aim: 3.452394269716863,
                tap: 2.2303303841054682,
                rhythm: 1.074263524539063,
                flashlight: 2.0781593015530326,
                visual: 0.9470378702526208,
                total: 5.19775981657938,
            },
            clockRatePcRating: {
                aim: 3.2635281869753108,
                speed: 2.643760548303716,
                flashlight: 2.4178869049490412,
                total: 6.249438719887609,
            },
        },
    );
});

test("Test difficulty calculation sample beatmap 2", async () => {
    await testDiffCalc("Kenji Ninuma - DISCOPRINCE (peppy) [Normal]", {
        noModDroidRating: {
            aim: 1.2099044844372617,
            tap: 1.0022465857232432,
            rhythm: 0.6444675301933946,
            flashlight: 0.5619627877879614,
            visual: 0.8106957044996128,
            total: 3.0050587770398707,
        },
        noModPcRating: {
            aim: 1.2908209234832633,
            speed: 1.1740787855226908,
            flashlight: 0.45614489508644646,
            total: 2.5818673751731174,
        },
        clockRateDroidRating: {
            aim: 1.63818749154388,
            tap: 1.4155266805568874,
            rhythm: 0.8278769058813412,
            flashlight: 0.7616388585022759,
            visual: 0.9661341177746647,
            total: 3.5681694922719376,
        },
        clockRatePcRating: {
            aim: 1.7354307108337401,
            speed: 1.6780678841141259,
            flashlight: 0.6675664837123483,
            total: 3.567086013547783,
        },
    });
});

test("Test difficulty calculation sample beatmap 3", async () => {
    await testDiffCalc(
        "sphere - HIGH POWERED (TV Size) (Azunyan-) [POWER OVERLOAD EXPERT]",
        {
            noModDroidRating: {
                aim: 2.917704627162872,
                tap: 3.117972161824811,
                rhythm: 1.3826649938231392,
                flashlight: 1.8089235913766049,
                visual: 0.9597850212718525,
                total: 5.77003945212112,
            },
            noModPcRating: {
                aim: 2.999322964576116,
                speed: 3.0164501737543654,
                flashlight: 1.9495654324845204,
                total: 6.284400524147425,
            },
            clockRateDroidRating: {
                aim: 4.084801790600609,
                tap: 4.286469840011708,
                rhythm: 1.5340787024519122,
                flashlight: 2.454309007618068,
                visual: 1.4621826796390938,
                total: 7.772679307516836,
            },
            clockRatePcRating: {
                aim: 4.221180552801728,
                speed: 4.543264147297868,
                flashlight: 2.9079445444539602,
                total: 9.170095020246256,
            },
        },
    );
});

test("Test difficulty calculation sample beatmap 4", async () => {
    await testDiffCalc("Ocelot - KAEDE (Hollow Wings) [EX EX]", {
        noModDroidRating: {
            aim: 3.089649380486703,
            tap: 1.426258222908513,
            rhythm: 0.8252861028509693,
            flashlight: 3.0218887418515936,
            visual: 2.8756928900460323,
            total: 5.80461523274164,
        },
        noModPcRating: {
            aim: 4.4331801158225765,
            speed: 1.8160213796912776,
            flashlight: 2.861312339427562,
            total: 7.638354833794094,
        },
        clockRateDroidRating: {
            aim: 4.315233036555293,
            tap: 2.02921324663126,
            rhythm: 1.0115706792350665,
            flashlight: 3.669340544722418,
            visual: 3.9995219805334994,
            total: 7.188772327639767,
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
                aim: 61.58263349200398,
                tap: 5.162578632768778,
                rhythm: 0.6426864308702024,
                flashlight: 73.90603672501867,
                visual: 1.7963187823379168,
                total: 43.86975850543983,
            },
            noModPcRating: {
                aim: 16.043384642499753,
                speed: 11.00140070367911,
                flashlight: 249.20600856096326,
                total: 29.33821693274539,
            },
            clockRateDroidRating: {
                aim: 76.17745573165945,
                tap: 6.9780334193777875,
                rhythm: 0.6571757664657181,
                flashlight: 73.49280516072994,
                visual: 5.215260283632203,
                total: 52.05366459700504,
            },
            clockRatePcRating: {
                aim: 53.35263471901449,
                speed: 13.206171599271972,
                flashlight: 48.506165940577986,
                total: 90.64153454262157,
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
