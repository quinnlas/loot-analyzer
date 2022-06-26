# loot-analyzer

This calculator helps you decide what to pick up when doing a slayer task (or getting more loot than you can carry from any source).

## Notes
- Does not track the rarity of the items or do any prediction of what may drop in the future.
- Does not account for banking. You can just use the tool and bank when it's convenient.
- Does not keep track of dropped items.
- Makes bad decisions sometimes:
  - Sometimes it will recommend to drop or not pick up a stackable item because it has a lower value, in cases where the stack will grow to a high enough value to be worth keeping. Could fix this with a threshold (where we assume a stack will double in value, e.g.)
  - Sometimes there is a reason to pick up an item you previously dropped. You can still analyze them as though they are a new drop if you find yourself in this situation.
  - It is possible that notepaper will be wasted if the program recommends you to note an item, then later to drop it.
  - The program may recommend to alch an untradeable item that you actually want to keep. You can remove these items from the possible drops to work around this.
  - The normal limitations of the GE guide prices also apply.

## Features
- Paste a loot table from the wiki into the table file and it will be translated into a json file.
  - Items that drop in a quantity >1 are assumed to be stackable, otherwise they are assumed to be non-stackable. Both can be overridden in the json.
  - The wiki does not include high alch prices so you will need to add those.
- Configure your setup:
  - Number of free inventory slots
  - Would be nice if you could increase/decrease this number during the task (if you pick up an untradeable or eat food, for example). This would cause an error if you decrease this when your inventory is already full, so you need to be able to drop.

## Moonshot Features
These are features that would be in the best possible version of this project, but are too difficult to be worth adding.
- Automatically pull the drop table from the wiki.
- Pull high alch prices from the wiki.
- These would be cached locally.
- Convert to alt1 plugin

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## TODO
- ~~display inventory~~
- ~~scan items into drop table~~
- ~~display drop table~~
- add item from drop table to inventory
- analyze what action to take with item from drop table
- display analysis
- allow selecting each option from analysis
- ~~calculate value of inventory~~
- ~~config alch cost, notepaper cost, inventory spaces~~
- ~~fix bootstrap-vue css~~
- ~~sort drop table by rarity~~
  - ~~need to determine the cutoffs, can just use Common 15%, Uncommon 3%, Rare .75%, Very Rare .1%~~
- option to easily enable/disable rare drop table
- saving state so it's there after a refresh
- various useful thresholds:
  - don't recommend alching over taking if only a certain profit difference (eg 10 gp)
