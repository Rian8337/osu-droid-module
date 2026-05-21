import {
    DroidPlayableBeatmap,
    ModUtil,
    Modes,
    Spinner,
} from "@rian8337/osu-base";

export abstract class DroidScoreUtils {
    /**
     * Calculates the maximum possible spinner bonus for a given beatmap.
     *
     * @param beatmap The beatmap to calculate the maximum spinner bonus for.
     * @returns The maximum spinner bonus.
     */
    static calculateMaximumSpinnerBonus(beatmap: DroidPlayableBeatmap): number {
        const { hitObjects } = beatmap;

        if (hitObjects.spinners === 0) {
            return 0;
        }

        const scoreMultiplier = ModUtil.calculateScoreMultiplier(
            beatmap.mods.values(),
            Modes.droid,
        );

        let bonus = 0;

        // In osu!droid, there is no time-based limit to spinner RPM, since the limit is
        // π/2 rad/*frame* and not rad/second.
        // For the purpose of this calculation, we assume that the frame rate is 120 FPS.
        // For scores that were set in a higher refresh rate, this estimation will underestimate
        // the actual maximum spinner bonus.
        const maximumRotationsPerSecond = (Math.PI / 2) * 120;

        // Taken from https://github.com/osudroid/osu-droid/blob/45ae4d66ce275382c5de037245ceca8704b3ae75/src/ru/nsu/ccfit/zuev/osu/game/GameScene.java#L1640.
        const minimumRotationsPerSecond = 2 + (2 * beatmap.difficulty.od) / 10;

        for (const obj of hitObjects.objects) {
            if (!(obj instanceof Spinner)) {
                continue;
            }

            const secondsDuration = obj.duration / 1000;

            const spinsRequiredBeforeBonus =
                secondsDuration * minimumRotationsPerSecond;

            const totalPossibleSpins =
                secondsDuration * maximumRotationsPerSecond;

            // In osu!droid, spinner bonus points are awarded for each full rotation every nth spin after the required spins.
            // For example, if a spinner requires 5.6 spins before bonus, the first bonus will be awarded at 6 spins instead
            // of 6.6 spins.
            const maximumPossibleBonusSpins = Math.max(
                0,
                Math.floor(totalPossibleSpins) -
                    Math.ceil(spinsRequiredBeforeBonus),
            );

            bonus += maximumPossibleBonusSpins * 1000;
        }

        return Math.floor(bonus * scoreMultiplier);
    }
}
