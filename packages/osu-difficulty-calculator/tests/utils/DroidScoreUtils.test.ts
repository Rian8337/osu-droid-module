import { BeatmapDecoder, Modes } from "@rian8337/osu-base";
import { DroidScoreUtils } from "../../src/utils/DroidScoreUtils";

describe("Test maximum spinner bonus", () => {
    const createBeatmap = (spinnerDuration: number) =>
        new BeatmapDecoder().decode(
            [
                "osu file format v14",
                "",
                "[General]",
                "Mode: 0",
                "",
                "[Difficulty]",
                "HPDrainRate:5",
                "CircleSize:4",
                "OverallDifficulty:5",
                "ApproachRate:9",
                "SliderMultiplier:1",
                "SliderTickRate:1",
                "",
                "[TimingPoints]",
                "0,500,4,2,0,100,1,0",
                "",
                "[HitObjects]",
                `256,192,1000,8,0,${(1000 + spinnerDuration).toString()},0:0:0:0:`,
            ].join("\n"),
            Modes.Droid,
        ).result;

    const maximumBonusFor = (spinnerDuration: number) => {
        const beatmap = createBeatmap(spinnerDuration);

        return DroidScoreUtils.calculateMaximumSpinnerBonus(
            beatmap,
            beatmap.createDroidPlayableBeatmap(),
        );
    };

    test("Caps spinning at a quarter rotation per frame at 120 FPS", () => {
        // 30 rotations per second over 2 seconds is 60 rotations. OD5 requires 3 rotations per
        // second, so 6 here - and osu!droid awards the first bonus at the 6th rotation.
        expect(maximumBonusFor(2000)).toBe((60 - 5) * 1000);
    });

    test("Awards a bonus from the first whole rotation past a fractional requirement", () => {
        // 28.5 rotations are possible, of which 2.85 are required, so the first bonus is awarded
        // at the 3rd rotation.
        expect(maximumBonusFor(950)).toBe((28 - 2) * 1000);
    });
});
