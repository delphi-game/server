const fs = require("fs").promises;


/* config = {
  pack: "Official",
  list: "Original",
  count: 25,
  colored: 3, // Cards per team
  teams: ['red', 'blue']
} */
module.exports = function createSet(config) {
  return new Promise(async (resolve, reject) => {
    const library = await fs.readFile("./assets/library.json").then(JSON.parse);

    if (library[config.pack] == undefined || library[config.pack].list[config.list] == undefined) {
      reject('Unknown pack or list')
      return
    }

    const deck = library[config.pack].list[config.list];
    const indexes = [];
    while (indexes.length < config.count) {
      const new_index = Math.floor(Math.random() * Math.floor(deck.length - 1));
      if (!indexes.includes(new_index)) {
        indexes.push(new_index);
      }
    }
    let cards = {};
    let slots = Array.from(Array(config.count).keys())

    indexes.forEach((index, i) => {
      let type = undefined;
      if (i == 0) {
        type = 'landmine';
      } else {
        type = 'none';

        for (let t = 0; t < config.teams.length; t++) {
          if (i < config.colored * t + 1) {
            type = config.teams[t];
            break
          }
        }
      }

      const card_number = slots[slots.length * Math.random() | 0]
      slots.splice(slots.indexOf(card_number), 1)

      cards["card-" + (card_number + 1)] = {
        word: deck[index],
        type,
        discovered: false,
      };
    });

    const keys = Object.keys(cards)
    cards = keys.sort((a, b) => a.substring(5) - b.substring(5)).reduce(function (result, key) {
      result[key] = cards[key];
      return result;
    }, {});

    resolve(cards)
  })
}

/*
class Set {
  constructor(cards) {
    this.cards = cards;
  }

  list(secret) {
    const cards = {};
    Object.keys(this.cards).forEach((id) => {
      cards[id] = {
        word: this.cards[id].word,
        type: this.cards[id].discovered || secret ? this.cards[id].type : 'unknown',
        discovered: this.cards[id].discovered,
      };
    });
    return cards;
  }

  discover(id) {
    this.cards[id].discovered = true;
  }
}
*/