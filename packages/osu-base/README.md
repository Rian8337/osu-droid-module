# About

The base module required for all my osu! modules.

# Features

This module serves as the foundation of all my osu! modules. It provides multiple features such as:

-   Accuracy calculator and estimator
    -   Calculate an accuracy value from hit values or estimate hit values from an accuracy value.
-   API request builders
    -   Supports osu!droid API and osu! API v1.
-   Beatmap decoder
    -   Fully decodes an `.osu` file into a `Beatmap` object that is easier to work with.
-   Beatmap encoder
    -   Will encode a beatmap into an `.osu` file with format version 14.
-   Hit window converters
    -   Convert an OD value to its hit window values and vice versa.
-   Map statistics calculator
    -   Calculate a given map statistics (CS, AR, OD, and HP) with modifications applied (mods, custom speed multiplier, etc).
-   Mod conversion utilities
    -   Convert a mod combination string in osu!droid (i.e. `hr`) and osu!standard (i.e. `HDHR`) into an array of mods.
    -   Available mods can be looked at the documentation.
-   Storyboard decoder
    -   Supports `.osb` and `.osu` files.
-   Storyboard encoder
    -   Storyboard will be encoded into a format that is supported by `.osu` files (that is, all variable instances will be replaced).

# Specific Requirements

If you want to use the osu!droid API, you need to have an osu!droid API key set as `DROID_API_KEY` environment variable.

If you want to use the osu! API, you need to have an osu! API key set as `OSU_API_KEY` environment variable.

See usage for more details.

# Installation

```
npm i @rian8337/osu-base
```

or

```
yarn add @rian8337/osu-base
```

# Usage

## Accuracy Calculator and Estimator

### Calculate Accuracy Value (0-1) from Hit Values

```js
import { Accuracy } from "@rian8337/osu-base";

// If you specified the amount of great hits (`n300`).
let accuracyValue = new Accuracy({
    n300: 1000,
    n100: 125,
    n50: 10,
    nmiss: 5,
}).value();

console.log(accuracyValue);

// If you didn't specify the amount of great hits (`n300`).
const objectCount = 2000;

accuracyValue = new Accuracy({
    n100: 125,
    n50: 10,
    nmiss: 5,
}).value(objectCount);
```

### Hit Values Estimation

The way this estimation works is that the estimator will see if the accuracy can be estimated by just using good hit values. Otherwise, the estimator will use meh hit values.

Keep in mind that it will not use the miss hit value.

```js
import { Accuracy } from "@rian8337/osu-base";

const accuracy = new Accuracy({
    percent: 99.7,
    nobjects: 2000,
});

console.log(accuracy.n300);
console.log(accuracy.n100);
console.log(accuracy.n50);
```

## API Request Builders

```js
import {
    DroidAPIRequestBuilder,
    OsuAPIRequestBuilder,
} from "@rian8337/osu-base";

const droidBuilder = new DroidAPIRequestBuilder()
    .setEndpoint("getuserinfo.php")
    .addParameter("uid", 51076);

const droidResult = await droidBuilder.sendRequest();

console.log(droidResult);

const osuBuilder = new OsuAPIRequestBuilder()
    .setEndpoint("get_beatmaps")
    .addParamter("b", 901854);

const osuResult = await osuBuilder.sendRequest();

console.log(osuResult);
```

## Beatmap Decoder

There are two primary ways of using the beatmap decoder.

### Using osu! API

```js
import { MapInfo } from "@rian8337/osu-base";

// MD5 hash is also supported in the first parameter
const beatmapInfo = await MapInfo.getInformation(901854);

if (!beatmapInfo.title) {
    return console.log("Beatmap not found");
}

// Decoded beatmap can be accessed via the `beatmap` field
console.log(beatmapInfo.beatmap);
```

#### Not retrieving beatmap file

You can also opt out from downloading the beatmap (`.osu`) file if you just want to retrieve information from the API by setting `file` to `false`, however a decoded beatmap will not be provided.

### Not using osu! API

```js
import { readFile } from "fs";
import { BeatmapDecoder } from "@rian8337/osu-base";

readFile("path/to/file.osu", { encoding: "utf-8" }, (err, data) => {
    if (err) throw err;

    const decoder = new BeatmapDecoder().decode(data);

    // Decoded beatmap can be accessed via the `result` field
    console.log(decoder.result);
});
```

## Beatmap Encoder

```js
import { Beatmap, BeatmapEncoder } from "@rian8337/osu-base";

const beatmap = new Beatmap();

const encoder = new BeatmapEncoder(beatmap).encode();

// Encoded beatmap can be accessed via the `result` field
console.log(encoder.result);
```

## Hit Window Converters

### OD to Hit Window

```js
import { DroidHitWindow, OsuHitWindow } from "@rian8337/osu-base";

// Convert OD to osu!droid hit window
const droidWindow = new DroidHitWindow(10);

console.log(droidHitWindow.hitWindowFor300());
console.log(droidHitWindow.hitWindowFor100());
console.log(droidHitWindow.hitWindowFor50());

// Calculating for the Precise mod in mind is also possible
console.log(droidHitWindow.hitWindowFor300(true));
console.log(droidHitWindow.hitWindowFor100(true));
console.log(droidHitWindow.hitWindowFor50(true));

// Convert OD to osu!standard hit window
const osuWindow = new OsuHitWindow(10);

console.log(osuWindow.hitWindowFor300());
console.log(osuWindow.hitWindowFor100());
console.log(osuWindow.hitWindowFor50());
```

### Hit Window to OD

```js
import { DroidHitWindow, OsuHitWindow } from "@rian8337/osu-base";

// Convert hit window to osu!droid OD
console.log(DroidHitWindow.hitWindow300ToOD(50));
console.log(DroidHitWindow.hitWindow100ToOD(100));
console.log(DroidHitWindow.hitWindow50ToOD(200));

// Calculating for the Precise mod in mind is also possible
console.log(DroidHitWindow.hitWindow300ToOD(25, true));
console.log(DroidHitWindow.hitWindow100ToOD(80, true));
console.log(DroidHitWindow.hitWindow50ToOD(130, true));

// Convert hit window to osu!standard OD
console.log(OsuHitWindow.hitWindow300ToOD(20));
console.log(OsuHitWindow.hitWindow100ToOD(60));
console.log(OsuHitWindow.hitWindow50ToOD(100));
```

## Map Statistics Calculator

The map statistics calculator can only be used once per instance.

### General Usage

```js
import { MapStats } from "@rian8337/osu-base";

const stats = new MapStats({
    cs: 4,
    ar: 9,
    od: 8,
    hp: 6,
}).calculate();

console.log(stats);
```

Every value is optional.

### Available Options

You can specify more options to alter the final result of the calculation:

-   Mods
-   Custom speed multiplier
-   Force AR (whether to keep the AR at its original value)
-   Game mode (switch between osu!droid and osu!standard, defaults to osu!standard)

```js
import { MapStats, ModUtil, modes } from "@rian8337/osu-base";

const stats = new MapStats({
    cs: 4,
    ar: 9,
    od: 8,
    hp: 6,
    mods: ModUtil.pcStringToMods("HDHR"),
    speedMultiplier: 1.25,
    isForceAR: true,
}).calculate({ mode: modes.osu });

console.log(stats);
```

## Mod Conversion Utilities

```js
import { ModUtil } from "@rian8337/osu-base";

// Convert droid mod string into an array of mods
console.log(ModUtil.droidStringToMods("hr"));

// Convert PC modbits into an array of mods
console.log(ModUtil.pcModbitsToMods(12));

// Convert PC mod string into an array mods
console.log(ModUtil.pcStringToMods("HDHR"));
```

## Storyboard Decoder

```js
import { readFile } from "fs";
import { StoryboardDecoder } from "@rian8337/osu-base";

readFile("path/to/file.osb", { encoding: "utf-8" }, (err, data) => {
    if (err) throw err;

    const decoder = new StoryboardDecoder().decode(data);

    // Decoded storyboard can be accessed via the `result` field
    console.log(decoder.result);
});
```

## Storyboard Encoder

```js
import { Storyboard, StoryboardEncoder } from "@rian8337/osu-base";

const storyboard = new Storyboard();

const encoder = new StoryboardEncoder(storyboard).encode();

// Encoded storyboard can be accessed via the `result` field
console.log(encoder.result);
```
