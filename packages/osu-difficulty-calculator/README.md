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

## General usage

```js
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidStarRating,
    MapStars,
    OsuStarRating,
} from "@rian8337/osu-difficulty-calculator";

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
console.log(rating.droidStars);
// osu!standard difficulty
console.log(rating.pcStars);
```

## Specifying parameters

Parameters can be applied to alter the result of the calculation:

-   Mods: Modifications that will be considered when calculating the difficulty of a beatmap. Defaults to none.
-   Custom statistics: Used to apply a custom speed multiplier and force AR. Defaults to none.

```js
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";
import { MapStars } from "@rian8337/osu-difficulty-calculator";

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
console.log(rating.droidStars);
// osu!standard difficulty
console.log(rating.pcStars);
```
