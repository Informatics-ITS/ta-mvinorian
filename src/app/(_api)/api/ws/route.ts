import { IncomingMessage } from 'http';
import queryString from 'query-string';
import { WebSocket } from 'ws';

import { getGameByCodeService, saveGameService } from '@/service/game-service';

export type WsMessageType = {
  state: string;
  data: string;
};

export type WsPlayersType = {
  attacker: string | null;
  defender: string | null;
};

export type WsGameType = {
  players: WsPlayersType;
  states: { [state: string]: string | null };
};

const games: {
  [code: string]: WsGameType;
} = {};

const clients: {
  [userId: string]: { socket: WebSocket; lastPing: number };
} = {};

const pendingSaves = new Map<string, NodeJS.Timeout>();
const debouncedSave = (code: string, delay: number = 1000) => {
  if (pendingSaves.has(code)) {
    clearTimeout(pendingSaves.get(code));
  }

  const timeout = setTimeout(async () => {
    if (games[code]) await saveGameService(code, games[code]);
    pendingSaves.delete(code);
  }, delay);

  pendingSaves.set(code, timeout);
};

const broadcast = (code: string, state: string) => {
  if (!games[code]) return;

  const game = games[code];
  const attacker = game.players.attacker;
  const defender = game.players.defender;

  const message: WsMessageType = {
    state,
    data: state === 'players' ? JSON.stringify(game.players) : (game.states[state] ?? ''),
  };

  const messageJson = JSON.stringify(message);

  if (attacker && clients[attacker]) clients[attacker].socket.send(messageJson);
  if (defender && clients[defender]) clients[defender].socket.send(messageJson);

  debouncedSave(code);
};

const loadingGames = new Set<string>();
const handleConnect = async (client: WebSocket, code: string, userId: string, role: string) => {
  clients[userId] = { socket: client, lastPing: Date.now() };

  if (!games[code] && !loadingGames.has(code)) {
    loadingGames.add(code);

    const game = await getGameByCodeService(code);
    if (game.success && game.data)
      games[code] = { players: { attacker: null, defender: null }, states: game.data.states };
    else {
      games[code] = {
        players: { attacker: null, defender: null },
        states: {},
      };
    }

    loadingGames.delete(code);
  }

  while (loadingGames.has(code)) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (role === 'attacker') games[code].players.attacker = userId;
  else if (role === 'defender') games[code].players.defender = userId;

  broadcast(code, 'players');
  Object.keys(games[code].states).forEach((state) => {
    broadcast(code, state);
  });
};

const handleMessage = (bytes: WebSocket.RawData, code: string) => {
  if (!games[code]) return;

  const message = JSON.parse(bytes.toString()) as WsMessageType;

  if (message.state === 'refresh') {
    broadcast(code, 'players');
    Object.keys(games[code].states).forEach((state) => {
      broadcast(code, state);
    });
    return;
  }

  games[code].states[message.state] = message.data;
  broadcast(code, message.state);
};

const handleClose = (client: WebSocket, code: string) => {
  if (!games[code]) return;

  for (const userId in clients) {
    if (clients[userId].socket !== client) continue;

    delete clients[userId];

    if (games[code].players.attacker === userId) games[code].players.attacker = null;
    else if (games[code].players.defender === userId) games[code].players.defender = null;

    break;
  }

  if (!games[code].players.attacker && !games[code].players.defender) {
    delete games[code];
    return;
  }

  broadcast(code, 'players');
};

const handlePong = (userId: string) => {
  if (!clients[userId]) return;
  clients[userId].lastPing = Date.now();
};

//? Garbage collector for inactive clients
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 60_000;

  for (const userId in clients) {
    const { socket, lastPing } = clients[userId];

    if (now - lastPing <= inactiveThreshold) continue;

    socket.terminate();
    delete clients[userId];

    for (const code in games) {
      if (games[code].players.attacker === userId) games[code].players.attacker = null;
      else if (games[code].players.defender === userId) games[code].players.defender = null;

      if (!games[code].players.attacker && !games[code].players.defender) delete games[code];
      else broadcast(code, 'players');
    }
  }
}, 30_000);

export function SOCKET(client: WebSocket, request: IncomingMessage) {
  const query = queryString.parseUrl(request.url ?? '').query;
  const code = query.code as string | null;
  if (!code) return client.close(4000, 'no game code provided');

  const userId = query.user as string | null;
  if (!userId) return client.close(4000, 'no user id provided');

  const role = query.role as string | null;
  if (!role) return client.close(4000, 'no role provided');
  if (role !== 'attacker' && role !== 'defender') return client.close(4000, 'invalid role provided');

  const interval = setInterval(() => {
    if (client.readyState === WebSocket.OPEN) client.ping();
  }, 30_000);

  handleConnect(client, code, userId, role);
  client.on('message', (bytes) => handleMessage(bytes, code));
  client.on('pong', () => handlePong(userId));
  client.on('close', () => {
    clearInterval(interval);
    handleClose(client, code);
  });
}
