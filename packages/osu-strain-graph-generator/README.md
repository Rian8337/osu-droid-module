# About

The strain graph generator portion of my osu! module.

# Features

This module provides a strain graph generator for osu!standard gamemode.

# Specific Requirements

This module has no specific requirements, however installed modules in installation may have specific requirements. It's advised to check them.

# Installation

```
npm i @rian8337/osu-base @rian8337/osu-difficulty-calculator @rian8337/osu-rebalance-difficulty-calculator
```

or

```
yarn add @rian8337/osu-base @rian8337/osu-difficulty-calculator @rian8337/osu-rebalance-difficulty-calculator
```

You can exclude a difficulty module that you don't plan to use.

# Usage

The usage below works for rebalance difficulty calculator as well.

```js
import { MapInfo } from "@rian8337/osu-base";
import { OsuStarRating } from "@rian8337/osu-difficulty-calculator";
import { default as getStrainChart } from "@rian8337/osu-strain-graph-generator";

(async () => {
    const beatmapInfo = await MapInfo.getInformation(901854);

    if (!beatmapInfo.title) {
        return console.log("Beatmap not found");
    }

    const rating = new OsuStarRating().calculate({
        map: beatmapInfo.map,
    });

    const chart = await getStrainChart(rating);

    console.log(chart);
})();
```
