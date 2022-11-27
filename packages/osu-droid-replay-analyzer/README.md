# About

A replay analyzer for osu!droid.

# Features

This module allows parsing osu!droid replay files (`.odr`) to get replay information.

Additionally, it provides a detection system to detect whether the player used three fingers or more to stream or two hands to jump.

Two hand detection is still a WIP.

# Specific Requirements

This module has no specific requirements, however installed modules in installation may have specific requirements. It's advised to check them.

# Installation

```
npm i @rian8337/osu-base @rian8337/osu-droid-replay-analyzer
```

or

```
yarn add @rian8337/osu-base @rian8337/osu-droid-replay-analyzer
```

# Usage

To use the replay analyzer, you need a replay file (`.odr`).

## Obtaining a replay file

There are multiple ways to get one.

### Obtaining a replay file with a score ID

If you know a score's ID, you can use it to directly retrieve a replay:

```js
import { MapInfo } from "@rian8337/osu-base";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

// Obtaining a beatmap file is optional, however it allows the replay analyzer to output more data
// for old replays (replay version 1 or 2)
const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// A `ReplayAnalyzer` instance that contains the replay
const replay = await new ReplayAnalyzer({
    scoreID: 12948732,
    map: beatmapInfo.beatmap,
}).analyze();

// The data of the replay
const { data } = replay;

if (!data) {
    return console.log("Replay not found");
}

console.log(data);
```

### Obtaining a local replay file

```js
import { readFile } from "fs";
import { MapInfo } from "@rian8337/osu-base";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

readFile("path/to/file.odr", async (err, replayData) => {
    if (err) throw err;

    // Obtaining a beatmap file is optional, however it allows the replay analyzer to output more data
    // for old replays (replay version 1 or 2)
    const beatmapInfo = await MapInfo.getInformation(901854);

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    // A `ReplayAnalyzer` instance that contains the replay
    const replay = new ReplayAnalyzer({ scoreID: 0, map: beatmapInfo.beatmap });

    replay.originalODR = replayData;

    await replay.analyze();

    // The data of the replay
    const { data } = replay;

    console.log(data);
});
```

## Playstyle detections

To use this, you need to have a calculated instance of a beatmap from `@rian8337/osu-difficulty-calculator` or `@rian8337/osu-rebalance-difficulty-calculator`:

```
npm i @rian8337/osu-difficulty-calculator @rian8337/osu-rebalance-difficulty-calculator
```

or

```
yarn add @rian8337/osu-difficulty-calculator @rian8337/osu-rebalance-difficulty-calculator
```

You can exclude a difficulty module that you don't plan to use.

```js
import { MapInfo, MapStats } from "@rian8337/osu-base";
import { DroidStarRating } from "@rian8337/osu-difficulty-calculator";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// A `ReplayAnalyzer` instance that contains the replay
const replay = await new ReplayAnalyzer({
    scoreID: 12948732,
    map: beatmapInfo.beatmap,
}).analyze();

// The data of the replay
const { data } = replay;

if (!data) {
    return console.log("Replay not found");
}

const stats = new MapStats({
    ar: data.forcedAR,
    speedMultiplier: data.speedModification,
    isForceAR: !isNaN(data.forcedAR),
    // In osu!droid version 1.6.7 and below, there exists a bug where NC is slower than DT in a few beatmaps
    // This option checks for said condition
    oldStatistics: data.replayVersion <= 3,
});

replay.map = new DroidStarRating().calculate({
    map: beatmapInfo.beatmap,
    mods: data.convertedMods,
    stats: stats,
});

// Check for three-finger usage
replay.checkFor3Finger();

// Check for two-hand usage
replay.checkFor2Hand();
```
