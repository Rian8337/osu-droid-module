# About

This module provides utilities for osu!droid related features.

# Features

This module allows retrieving information about a player or a score from a player.

# Specific Requirements

This module requires an osu!droid API key set as `DROID_API_KEY` environment variable.

# Installation

```
npm i @rian8337/osu-droid-utilities
```

or

```
yarn add @rian8337/osu-droid-utilities
```

# Usage

## Retrieving a player's information

```js
import { Player } from "@rian8337/osu-droid-utilities";

// Both uid and username are supported, however if both are specified, uid is used
const player = await Player.getInformation({
    uid: 51076,
    username: "Rian8337",
});

if (!player.username) {
    return console.log("Player not found");
}

console.log(player);
```

## Retrieving a score from a player

```js
import { Score } from "@rian8337/osu-droid-utilities";

const score = await Score.getFromHash({ uid: 51076, hash: "hash123" });

if (!score.title) {
    return console.log("Score not found");
}

console.log(score);
```
