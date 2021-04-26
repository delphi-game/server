const db = require('quick.db')
const roomDB = new db.table('rooms')
const createSet = require("./createSet");

module.exports = {
  /* room = {
      teams: ['red', 'blue'],
      type: "words" || "pictures",
      set: {
        pack: "Official",
        list: "Original",
        count: 25,
        colored: 3,
      },
  } */
  create(id, room) {
      return new Promise((resolve, reject) => {
        // Tests
        if (Object.values(roomDB.all()).map(x => x.ID).includes(id)) {
          reject('Used Room ID')
          return -1
        }
        const code = /^[A-Z]{4}$/
        if (!code.test(id)) {
          reject('Invalid Room ID format')
          return
        }
        if (room.type != 'words' && room.type != 'pictures') {
          reject('Invalid set type')
          return
        }
  
        createSet({
          ...room.set,
          teams: room.teams
        }).then(set => {
          roomDB.set(id, {
            id: id,
            created: Date.now(),
            type: room.type,
            state: "ready",
            closed: false,
            players: {},
            teams: room.teams.reduce((teams, color) => (teams[color] = { score: room.set.colored }, teams), {}),
            set,
          })
          resolve()
        }).catch(err => { 
          reject(err)
         })
      });
  },
  /* player = {
    key: "UUID",
    room: "ID",
    name: 'name",
    team: "blue",
    role: "guesser",
  } */
  addPlayer(player) {
    return new Promise((resolve, reject) => {
      // Tests
      const uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      if (!uuid.test(player.key)) {
        reject('Invalid UUID')
        return
      }
      if (!Object.values(roomDB.all()).map(x => x.ID).includes(player.room)) {
        reject('Unknown Room ID')
        return
      }
      if (!Object.keys(roomDB.get(player.room + '.teams')).includes(player.team)) {
        reject('Unknown Team Color')
        return
      }
      const players = roomDB.get(player.room + '.players')
      if (Object.keys(players).includes(player.key)) {
        reject('Player key already in use')
        return
      }
      if (Object.values(players).map(x => x.name).includes(player.name)) {
        reject('Player name already in use')
        return
      }
      if (player.role != 'guesser' && player.role != 'thinker') {
        reject('Invalid role type')
        return
      }

      // Add player to room
      roomDB.set(player.room + '.players.' + player.key, {
        name: player.name,
        team: player.team,
        role: player.role,
      })
      resolve()
    });
  },
  subtractPoint(id, team) {
    return new Promise((resolve, reject) => {
      // Tests
      if (!Object.values(roomDB.all()).map(x => x.ID).includes(id)) {
        reject('Unknown Room ID')
        return -1
      }
      if (!Object.keys(roomDB.get(id + '.teams')).includes(team)) {
        reject('Unknown Team Color')
        return -1
      }
      const current_score = roomDB.get(id + '.teams.' + team + '.score')
      if (current_score < 1) {
        reject('Score below zero')
        return -1
      }

      // Subtract one point from the team
      roomDB.subtract(id + '.teams.' + team + '.score', 1)
      resolve(current_score)
    });
  },
  failTeam(id, team) {
    return new Promise((resolve, reject) => {
      // Tests
      if (!Object.values(roomDB.all()).map(x => x.ID).includes(id)) {
        reject('Unknown Room ID')
        return
      }
      if (!Object.keys(roomDB.get(id + '.teams')).includes(team)) {
        reject('Unknown Team Color')
        return
      }

      // Set team score to zero
      roomDB.set(id + '.teams.' + team + '.score', 0)
      resolve()
    });
  },
  getTeamPlayers(id, team) {
    return Object.fromEntries(
      Object.entries(roomDB.get(id + '.players')).filter(([key, value]) => value.team == team) )
  },
  setState(id, state) {
    roomDB.set(id + '.state', state)
  },
  get(id) {
    return roomDB.get(id)
  },
  delete(id) {
    roomDB.delete(id)
  },
  clearAll() {
    roomDB.all().map(x => x.ID).forEach(id => roomDB.delete(id))
  },
  listAll() {
    return roomDB.all().map(x => x.ID)
  },
}