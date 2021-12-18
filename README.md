# About

This module is published for my own convenience so that I can use it across multiple projects of mine without having to manually transfer files, namely:

-   [Alice](https://github.com/Rian8337/Alice)
-   [droidppboard](https://github.com/Rian8337/droidppboard)

# Features

-   Beatmap parser
-   osu! difficulty calculator
    -   This includes a strain graph generator.
-   osu! performance calculator
-   osu!droid replay analyzer
    -   Allows parsing osu!droid replay files (`.odr`) to get replay information.
    -   Three finger/two hand detection
        -   Uses cursor movement and beatmap difficulty data to detect.
        -   Two hand detection is not practical as it's still a WIP.

You should not expect osu! difficulty and performance calculator to be on par with osu!web or other calculators. This is because I tend to update them every time a new difficulty change in osu!lazer is approved. Additionally, an error margin should be expected due to differences between C# (the language that osu!lazer uses) and TypeScript.

All features that the module offers are interchangeable with two gamemodes where they are applicable (such as difficulty and performance calculator):

-   osu!droid
-   osu!standard

# Requirements

Generally, nothing is required to use the module. However, online features may require the following:

-   For osu!droid online-related features, you need to have an osu!droid API key specified as `DROID_API_KEY` environment variable.
-   For osu!standard online-related features, you need to have an osu! API key specified as `OSU_API_KEY` environment variable.

The table below lists all classes along with their methods that require an osu!droid API key or osu! API key.

-   osu!droid API key
    | Class | Method(s) |
    |-|-|
    | `MapInfo` | `fetchDroidLeaderboard()` |
    | `Player` | `static getInformation()` |
    | `Score` | `static getFromHash()` |
-   osu! API key
    | Class | Method(s) |
    |-|-|
    | `MapInfo` | `static getInformation()` |

# Examples

Below are some examples on how to use the features offered by this module.

The beatmap parser is the most important part of the module as it is required to obtain a `Beatmap` instance, which is required for all features of the module.

While the beatmap parser provides ways to obtain a `Beatmap` instance with and without osu! API, every examples after the beatmap parser will obtain the `Beatmap` instance using osu! API.

-   [Beatmap Parser](#beatmap-parser)
    -   [Usage with osu! API](#parsing-with-osu-api)
    -   [Usage without osu! API](#parsing-without-osu-api)
-   [osu! difficulty calculator](#osu-difficulty-calculator)
    -   [General usage](#general-difficulty-calculator-usage)
    -   [Specifying parameters](#specifying-difficulty-calculation-parameters)
    -   [Generating a strain graph](#generating-a-strain-graph)
-   [osu! performance calculator](#osu-performance-calculator)
    -   [General usage](#general-performance-calculator-usage)
    -   [Specifying parameters](#specifying-performance-calculation-parameters)
-   [osu!droid replay analyzer](#osudroid-replay-analyzer)
    -   [Usage with osu!droid API key](#using-replay-analyzer-with-osudroid-api-key)
    -   [Usage with a score ID](#using-replay-analyzer-with-a-score-id)
    -   [Usage with a local replay file](#using-replay-analyzer-with-a-local-replay-file)

## Beatmap Parser

### Parsing with osu! API

```js
import { MapInfo } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// Parsed beatmap can be accessed via the `map` field
// Note that the parsed beatmap will be cloned every time this is called. This allows caching of the original instance when needed
console.log(beatmapInfo.map);
```

### Parsing without osu! API

```js
import { readFile } from "fs";
import { Parser } from "osu-droid";

readFile("path/to/file.osu", { encoding: "utf-8" }, (err, data) => {
    if (err) throw err;

    const parser = new Parser().parse(data);

    // Parsed beatmap can be accessed via the `map` field
    console.log(parser.map);
});
```

Both examples return a `Beatmap` instance, which is necessary for some features of the module.

## osu! difficulty calculator

It is important to note that the difficulty calculator will mutate the original `Beatmap` instance.
If you don't want this to happen, use the clone utility provided in the module:

```js
import { Utils } from "osu-droid";

const anotherBeatmap = Utils.deepCopy(beatmap);
```

The `MapInfo` and `MapStars` class do this internally and thus manual cloning is not required.

### General difficulty calculator usage

```js
import { DroidStarRating, MapInfo, MapStars, OsuStarRating } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// Calculate osu!droid difficulty
const droidRating = new DroidStarRating().calculate({
    map: beatmapInfo.map,
});

console.log(droidRating);

// Calculate osu!standard difficulty
const osuRating = new OsuStarRating().calculate({
    map: beatmapInfo.map,
});

console.log(osuRating);

// Calculate both osu!droid and osu!standard difficulty
const rating = new MapStars().calculate({
    map: beatmapInfo.map,
});

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
import { MapInfo, MapStars, MapStats, ModUtil } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const mods = ModUtil.pcStringToMods("HDHR");

const stats = new MapStats({
    ar: 9,
    isForceAR: true,
    speedMultiplier: 1.5,
});

// Also available for `DroidStarRating` and `OsuStarRating`
const rating = new MapStars().calculate({
    map: beatmapInfo.map,
    mods: mods,
    stats: stats,
});

// osu!droid difficulty
console.log(rating.droid);
// osu!standard difficulty
console.log(rating.osu);
```

### Generating a strain graph

The following example generates strain graph for the osu!standard gamemode. For osu!droid, replace `OsuStarRating` with `DroidStarRating`.

The strain graph is returned as a `Buffer`.

```js
import { MapInfo, OsuStarRating } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const rating = new OsuStarRating().calculate({
    map: beatmapInfo.map,
});

// Generate a graph without a background and black graph color
console.log(await rating.getStrainChart());

// Generate a graph using the beatmap set's banner and black graph color
// For usage without osu! API, use `<Parser>.beatmapsetId`
console.log(await rating.getStrainChart(beatmapInfo.beatmapsetID));

// Generate a graph using the beatmap set's banner and a specific graph color
console.log(await rating.getStrainChart(beatmapInfo.beatmapsetID, "#fcba03"));
```

## osu! performance calculator

### General performance calculator usage

```js
import {
    DroidPerformanceCalculator,
    MapInfo,
    MapStars,
    OsuPerformanceCalculator,
} from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const rating = new MapStars().calculate({
    map: beatmapInfo.map,
});

// osu!droid performance
const droidPerformance = new DroidPerformanceCalculator().calculate({
    stars: rating.droid,
});
console.log(droidPerformance);

// osu!standard performance
const osuPerformance = new OsuPerformanceCalculator().calculate({
    stars: rating.osu,
});
console.log(osuPerformance);
```

### Specifying performance calculation parameters

Parameters can be passed to alter the result of the calculation:

-   Combo: The maximum combo achieved. Defaults to the beatmap's maximum combo.
-   Accuracy: The accuracy achieved. Defaults to 100%.
-   Misses: The amount of misses achieved.
-   Tap penalty: Penalty given from three-finger detection. Only applied for osu!droid gamemode. Defaults to 1.
-   Custom statistics: Used to apply a custom speed multiplier and force AR. Defaults to none.

The following example uses osu! API key to obtain a beatmap and calculates for the osu!standard gamemode. See [this](#beatmap-parser) section for more methods on obtaining a beatmap. For osu!droid, replace `OsuPerformanceCalculator` with `DroidPerformanceCalculator` and `OsuStarRating` with `DroidStarRating`.

```js
import {
    Accuracy,
    MapInfo,
    MapStats,
    OsuPerformanceCalculator,
    OsuStarRating,
} from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const rating = new OsuStarRating().calculate({
    map: beatmapInfo.map,
});

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

const performance = new OsuPerformanceCalculator().calculate({
    stars: rating.osu,
    combo: 1250,
    accPercent: accuracy,
    // The tap penalty can be properly obtained by checking a replay for three finger usage
    // However, a custom value can also be provided
    tapPenalty: 1.5,
    stats: stats,
});

console.log(performance);
```

## osu!droid replay analyzer

To use the replay analyzer, you need a replay file (`.odr`).

### Using replay analyzer with osu!droid API key

If you have an osu!droid API key, you can get a score's replay:

```js
import { DroidStarRating, MapInfo, MapStats, Score } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

const score = await Score.getFromHash({
    uid: 51076,
    hash: beatmapInfo.hash,
});

await score.downloadReplay();

// A `ReplayAnalyzer` instance that contains the replay
const { replay } = score;
// The data of the replay
const { data } = replay;

if (!data) {
    return console.log("Replay not found");
}

const stats = new MapStats({
    ar: data.forcedAR,
    speedMultiplier: data.speedModification,
    isForceAR: !isNaN(data.forcedAR),
    // In droid version 1.6.7 and below, there exists a bug where NC is slower than DT in a few beatmaps
    // This option checks for said condition
    oldStatistics: data.replayVersion <= 3,
});

replay.map = new DroidStarRating().calculate({
    map: beatmapInfo.map,
    mods: data.convertedMods,
    stats: stats,
});

// More data can be obtained after specifying beatmap. We can call this method again to do so
await replay.analyze();

// Check for three-finger usage
replay.checkFor3Finger();

// Check for two-hand usage
replay.checkFor2Hand();
```

### Using replay analyzer with a score ID

If you know a score's ID, you can use it to directly retrieve a replay:

```js
import { DroidStarRating, MapInfo, MapStats, ReplayAnalyzer } from "osu-droid";

const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// A `ReplayAnalyzer` instance that contains the replay
const replay = await new ReplayAnalyzer({ scoreID: 12948732 }).analyze();
// The data of the replay
const { data } = replay;

if (!data) {
    return console.log("Replay not found");
}

const stats = new MapStats({
    ar: data.forcedAR,
    speedMultiplier: data.speedModification,
    isForceAR: !isNaN(data.forcedAR),
    // In droid version 1.6.7 and below, there exists a bug where NC is slower than DT in a few beatmaps
    // This option checks for said condition
    oldStatistics: data.replayVersion <= 3,
});

replay.map = new DroidStarRating().calculate({
    map: beatmapInfo.map,
    mods: data.convertedMods,
    stats: stats,
});

// More data can be obtained after specifying beatmap. We can call this method again to do so
await replay.analyze();

// Check for three-finger usage
replay.checkFor3Finger();

// Check for two-hand usage
replay.checkFor2Hand();
```

### Using replay analyzer with a local replay file

```js
import { readFile } from "fs";
import { DroidStarRating, MapInfo, MapStats, ReplayAnalyzer } from "osu-droid";

readFile("path/to/file.odr", async (err, replayData) => {
    if (err) throw err;

    const beatmapInfo = await MapInfo.getInformation({ beatmapID: 901854 });

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    // A `ReplayAnalyzer` instance that contains the replay
    const replay = new ReplayAnalyzer({ scoreID: 0 });

    replay.originalODR = replayData;

    await replay.analyze();

    // The data of the replay
    const { data } = replay;

    const stats = new MapStats({
        ar: data.forcedAR,
        speedMultiplier: data.speedModification,
        isForceAR: !isNaN(data.forcedAR),
        // In droid version 1.6.7 and below, there exists a bug where NC is slower than DT in a few beatmaps
        // This option checks for said condition
        oldStatistics: data.replayVersion <= 3,
    });

    replay.map = new DroidStarRating().calculate({
        map: beatmapInfo.map,
        mods: data.convertedMods,
        stats: stats,
    });

    // More data can be obtained after specifying beatmap. We can call this method again to do so
    await replay.analyze();

    // Check for three-finger usage
    replay.checkFor3Finger();

    // Check for two-hand usage
    replay.checkFor2Hand();
});
```
