// const io = require("socket.io")(3000);

const rooms = require("./rooms");
/*
const fs = require("fs").promises;

const library = fs.readFile("./assets/library.json").then(JSON.parse).then(library => {
  let decks = {}

  Object.keys(library).forEach(pack => {
    if (library[pack].type == 'list') {
      decks[pack] = Object.keys(library[pack].list)
    }
  })

  console.log(decks)
});
*/




rooms.clearAll()

rooms.create('DFSE', {
  teams: ['yellow', 'green'],
  type: "words",
  set: {
    pack: "Official",
    list: "Duet",
    count: 25,
    colored: 5,
  },
}).then(() => { console.log(rooms.get('DFSE')) })
.catch(err => { console.log(err) })



/*
rooms.addPlayer({
    key: "404a3d5b-5720-4666-81fc-f1bef837b877",
    room: "DFSE",
    name: "LoganSmall",
    team: "green",
    role: "thinker",
  }).catch(err => { console.log(err) })
*/

//console.log(rooms.getTeamPlayers('DFSE', 'green'))

