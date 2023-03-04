/* eslint-disable @typescript-eslint/no-var-requires */
const {
    MapInfo,
    ModUtil,
    BeatmapDecoder,
    Accuracy,
} = require("./packages/osu-base/dist");
const {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} = require("./packages/osu-difficulty-calculator/dist");
const { ReplayAnalyzer } = require("./packages/osu-droid-replay-analyzer/dist");
const { Score } = require("./packages/osu-droid-utilities/dist");
const { readFile } = require("fs/promises");

// (async () => {
//     const beatmapInfo = await MapInfo.getInformation(
//         "153a4615c9cfd9d89756a07e9c9d996e"
//     );

//     if (!beatmapInfo?.hasDownloadedBeatmap()) {
//         return console.log("Beatmap not found");
//     }

//     const calculator = new DroidDifficultyCalculator(
//         beatmapInfo.beatmap
//     ).calculate({
//         mods: ModUtil.pcStringToMods("HDDTHR"),
//     });
//     const performance = new DroidPerformanceCalculator(
//         calculator.attributes
//     ).calculate({
//         combo: 1107,
//         accPercent: new Accuracy({
//             n300: 681,
//             n100: 153,
//             n50: 17,
//             nmiss: 0,
//         }),
//     });

//     const replay = new ReplayAnalyzer({ scoreID: 0, map: calculator });
//     replay.originalODR = await readFile("20452010.odr");
//     await replay.analyze();
//     replay.checkFor3Finger();
//     console.log("Tap penalty:", replay.tapPenalty);

//     performance.applyTapPenalty(replay.tapPenalty);

//     console.log(calculator.toString());
//     console.log(performance.toString());

//     // console.table(calculator.objects
//     //     // .sort((a, b) => b.visualStrain - a.visualStrain)
//     //     .map(v => {
//     //         return {
//     //             startTime: v.object.startTime,
//     //             visualStrain: v.visualStrain,
//     //             noteDensity: v.noteDensity,
//     //             overlappingFactor: v.overlappingFactor,
//     //         };
//     //     })
//     // );
// })();

(async () => {
    // const beatmap = new BeatmapDecoder().decode(
    //     await readFile(
    //         "./ARM feat. Nanahira - BakunanaTestroyer (intoon) [Nana].osu",
    //         { encoding: "utf-8" }
    //     )
    // ).finalResult;
    // const beatmap = new BeatmapDecoder().decode(
    //     await readFile(
    //         "./Galantis - You (Alumetri) [Hey! What's your name].osu",
    //         { encoding: "utf-8" }
    //     )
    // ).finalResult;
    // const beatmap = new BeatmapDecoder().decode(
    //     await readFile(
    //         "beatMARIO - Night of Knights (alacat) [The World].osu",
    //         { encoding: "utf-8" }
    //     )
    // ).finalResult;
    const beatmapInfo = await MapInfo.getInformation(1982146);
    if (!beatmapInfo?.hasDownloadedBeatmap()) {
        return;
    }
    console.log(beatmapInfo.fullTitle);

    const score = await Score.getFromHash(88808, beatmapInfo.hash);
    if (!score) {
        return;
    }

    const calculator = new DroidDifficultyCalculator(
        beatmapInfo.beatmap
    ).calculate({
        mods: score.mods,
    });
    let performance = new DroidPerformanceCalculator(
        calculator.attributes
    ).calculate({
        combo: score.combo,
        accPercent: score.accuracy,
        // combo: 1246,
        // accPercent: new Accuracy({
        //     n300: 1008,
        //     n100: 3,
        // }),
    });

    console.log(calculator.toString());
    console.log(performance.toString());

    await score.downloadReplay();
    score.replay.beatmap = beatmapInfo.beatmap;
    score.replay.difficultyAttributes = calculator.attributes;
    // const replay = new ReplayAnalyzer({ scoreID: 0, map: calculator });
    // replay.originalODR = await readFile("9363314.odr");
    // replay.originalODR = await readFile("14311131.odr");
    // replay.originalODR = await readFile("16121419.odr");
    // replay.originalODR = await readFile("16158301.odr");
    // replay.originalODR = await readFile("20362025.odr");
    await score.replay.analyze();
    // replay.checkFor2Hand();
    score.replay.checkForSliderCheesing();

    // performance = new DroidPerformanceCalculator(
    //     calculator.attributes
    // ).calculate({
    //     // combo: 706,
    //     // accPercent: new Accuracy({
    //     //     n300: 561,
    //     //     n100: 20,
    //     // }),
    //     // combo: 1246,
    //     // accPercent: new Accuracy({
    //     //     n300: 1008,
    //     //     n100: 3,
    //     // }),
    // });
    // console.log(score.replay.sliderCheesePenalty.aimPenalty);
    // console.log(score.replay.sliderCheesePenalty.flashlightPenalty);
    // console.log(score.replay.sliderCheesePenalty.visualPenalty);
    performance.applyAimSliderCheesePenalty(
        score.replay.sliderCheesePenalty.aimPenalty
    );
    performance.applyVisualSliderCheesePenalty(
        score.replay.sliderCheesePenalty.visualPenalty
    );

    console.log(calculator.toString());
    console.log(performance.toString());

    // console.table(calculator.objects
    //     // .sort((a, b) => b.visualStrain - a.visualStrain)
    //     .map(v => {
    //         return {
    //             startTime: v.object.startTime,
    //             visualStrain: v.visualStrain,
    //             noteDensity: v.noteDensity,
    //             overlappingFactor: v.overlappingFactor,
    //         };
    //
})();
