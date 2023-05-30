
const WHITE_CARDS = 558;
const BLACK_CARDS = 102;

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const players = {};
const selectedCards = {};

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

//my boi their is a method for this in js
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function randomOrder(size) {
	return shuffle([...Array(size).keys()]);
}

let whiteCardOrder = randomOrder(WHITE_CARDS);
let blackCardOrder = randomOrder(BLACK_CARDS);

let gameStarted = false;

io.on('connection', socket => {
	console.log('Client connected.');
	socket.emit('connected');

	socket.on('player_join', (name, callback) => {
		
		if (!gameStarted && !(name in players) && Object.keys(players).length < 6) {
			callback(Object.keys(players));
			io.emit('new_player', name);
			players[name] = socket;
		}

		if (Object.keys(players).length >= 1) {
			for (p in players) {
				players[p].emit('prepare_start');
			}
		}
	});

	socket.on('card_select', (card, player) => {
		selectedCards[card] = player;
		
    if(selectedCards.length == players.length) {
      socket.emit('judge_time', selectedCards);
    }
	});

	socket.on('judge_select', card => {
		// show that the player with this card won etc. etc.
		io.emit('player_win', selectedCards[card]);
	});

	socket.on('start_game', () => {
		for (p in players) {
				players[p].emit('start_game');
		}
	});
});

server.listen(3000);
console.log('Server running...');