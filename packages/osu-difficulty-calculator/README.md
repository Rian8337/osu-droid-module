# About

The difficulty and performance calculator portion of my osu! module that uses the current difficulty and performance algorithm.

# Features

This module provides an osu! difficulty and performance calculator that uses the current difficulty and performance algorithm for osu!standard gamemode.

An error margin should be expected from difficulty and performance calculator due to differences between C# and TypeScript.

# Specific Requirements

This module has no specific requirements, however installed modules in installation may have specific requirements. It's advised to check them.

# Installation

```
npm i @rian8337/osu-base @rian8337/osu-difficulty-calculator
```

or

```
yarn add @rian8337/osu-base @rian8337/osu-difficulty-calculator
```

# Usage

## Difficulty calculator

```js
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    MapStars,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";

const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// Calculate osu!droid difficulty
const droidRating = new DroidDifficultyCalculator(
    beatmapInfo.beatmap
).calculate();

console.log(droidRating);

// Calculate osu!standard difficulty
const osuRating = new OsuDifficultyCalculator(beatmapInfo.beatmap).calculate();

console.log(osuRating);

// Calculate both osu!droid and osu!standard difficulty
const rating = new MapStars(beatmapInfo.beatmap);

// osu!droid difficulty
console.log(rating.droid);
// osu!standard difficulty
console.log(rating.osu);
```

### Specifying difficulty calculation parameters

Parameters can be applied to alter the result of the calculation:

-   Mods: Modifications that will be considered when calculating the difficulty of a beatmap. Defaults to none.
-   Custom statistics: Used to apply a custom speed multiplier and force AR. Defaults to none.

```js
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";
import { MapStars } from "@rian8337/osu-difficulty-calculator";

const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const mods = ModUtil.pcStringToMods("HDHR");

const stats = new MapStats({
    ar: 9,
    isForceAR: true,
    speedMultiplier: 1.5,
});

// Also available in `DroidDifficultyCalculator` and `OsuDifficultyCalculator` as a parameter of `calculate`
const rating = new MapStars(beatmapInfo.beatmap, {
    mods: mods,
    stats: stats,
});

// osu!droid difficulty
console.log(rating.droid);
// osu!standard difficulty
console.log(rating.osu);
```

## Performance calculator

```js
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidPerformanceCalculator,
    MapStars,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";

const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const rating = new MapStars(beatmapInfo.beatmap);

// osu!droid performance
const droidPerformance = new DroidPerformanceCalculator(
    rating.droid.attributes
).calculate();

console.log(droidPerformance);

// osu!standard performance
const osuPerformance = new OsuPerformanceCalculator(
    rating.osu.attributes
).calculate();

console.log(osuPerformance);
```

### Specifying performance calculation parameters

Parameters can be passed to alter the result of the calculation:

-   Combo: The maximum combo achieved. Defaults to the beatmap's maximum combo.
-   Accuracy: The accuracy achieved. Defaults to 100%.
-   Misses: The amount of misses achieved.
-   Tap penalty: Penalty given from three-finger detection. Only applied for osu!droid gamemode. Defaults to 1.
-   Custom statistics: Used to apply a custom speed multiplier and force AR. Defaults to none.

```js
import { Accuracy, MapInfo, MapStats } from "@rian8337/osu-base";
import {
    OsuPerformanceCalculator,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";

const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const rating = new OsuDifficultyCalculator(beatmapInfo.beatmap).calculate();

const accuracy = new Accuracy({
    // Specify your misses here
    nmiss: 1,

    // The module provides a convenient way to specify accuracy based on the data that you have
    // Remove the codes below as you see fit

    // If you have hit data (amount of 300s, 100s, and 50s)
    n300: 1000,
    n100: 0,
    n50: 0,

    // If you have accuracy percentage
    // While this method is more convenient to use, the amount of 300s, 100s, and 50s will be estimated
    // This will lead to values being off when calculating for specific accuracies
    percent: 100,
    nobjects: beatmapInfo.objects,
});

const stats = new MapStats({
    ar: 9.5,
    isForceAR: true,
    speedMultiplier: 1.25,
});

const performance = new OsuPerformanceCalculator(rating.attributes).calculate({
    combo: 1250,
    accPercent: accuracy,
    // The tap penalty will only be used by `DroidPerformanceCalculator` and
    // can be properly obtained by checking a replay for three finger usage
    // However, a custom value can also be provided
    tapPenalty: 1.5,
    stats: stats,
});

console.log(performance);
```
