const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// ── GAME STATE (solo en memoria, se borra al reiniciar) ──
let game = defaultState();

function defaultState() {
  return {
    phase: 'lobby',       // lobby | question | results | podium
    questionIndex: 0,
    startTime: null,
    players: {},          // { name: { score, answers[] } }
    answers: {}           // { "q0": { name: { ans, correct, timeMs } } }
  };
}

const Q_TIME = 20000; // 20 segundos en ms
let questionTimer = null;

io.on('connection', (socket) => {
  // Enviar estado actual al nuevo cliente
  socket.emit('state', game);

  // ── HOST: iniciar quiz ──
  socket.on('host:start', () => {
    if (Object.keys(game.players).length === 0) return;
    game.phase = 'question';
    game.questionIndex = 0;
    game.startTime = Date.now();
    io.emit('state', game);
    scheduleAutoResults();
  });

  // ── HOST: ver resultados (manual o automático) ──
  socket.on('host:showResults', () => {
    clearTimeout(questionTimer);
    game.phase = 'results';
    io.emit('state', game);
  });

  // ── HOST: siguiente pregunta ──
  socket.on('host:next', () => {
    const TOTAL = 8; // número de preguntas
    if (game.questionIndex + 1 >= TOTAL) {
      game.phase = 'podium';
    } else {
      game.questionIndex++;
      game.startTime = Date.now();
      game.phase = 'question';
      scheduleAutoResults();
    }
    io.emit('state', game);
  });

  // ── HOST: reiniciar ──
  socket.on('host:reset', () => {
    clearTimeout(questionTimer);
    game = defaultState();
    io.emit('state', game);
  });

  // ── PLAYER: unirse ──
  socket.on('player:join', ({ name }, cb) => {
    if (game.phase !== 'lobby') return cb({ error: 'El quiz ya comenzó.' });
    if (game.players[name]) return cb({ error: 'Nombre ya en uso.' });
    game.players[name] = { score: 0, answers: [] };
    io.emit('state', game);
    cb({ ok: true });
  });

  // ── PLAYER: responder ──
  socket.on('player:answer', ({ name, ans }) => {
    const qi = game.questionIndex;
    const key = `q${qi}`;
    if (!game.answers[key]) game.answers[key] = {};
    if (game.answers[key][name]) return; // ya respondió

    const CORRECT = [3,1,2,1,2,2,0,1]; // respuestas correctas por pregunta
    const isCorrect = ans === CORRECT[qi];
    const timeMs = Date.now() - game.startTime;
    const timeLeft = Math.max(0, Q_TIME - timeMs);
    const pts = isCorrect ? Math.round(1000 * (0.3 + 0.7 * (timeLeft / Q_TIME))) : 0;

    game.answers[key][name] = { ans, correct: isCorrect, timeMs };
    if (!game.players[name]) game.players[name] = { score: 0, answers: [] };
    game.players[name].score = (game.players[name].score || 0) + pts;
    game.players[name].answers = [...(game.players[name].answers || []), isCorrect];

    io.emit('state', game);
  });
});

function scheduleAutoResults() {
  clearTimeout(questionTimer);
  questionTimer = setTimeout(() => {
    game.phase = 'results';
    io.emit('state', game);
  }, Q_TIME + 500);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🏍️ Honda Quiz en puerto ${PORT}`));
