import { IncomingMessage } from 'http';
import queryString from 'query-string';
import { WebSocket } from 'ws';

export type WsMessageType = {
  state: string;
  data: string;
};

export type WsPlayersType = {
  attacker: string | null;
  defender: string | null;
};

const games: {
  [k: string]: {
    players: WsPlayersType;
    state: { [k: string]: string | null };
  };
} = {};

const clients: {
  [k: string]: WebSocket;
} = {};

const broadcast = (code: string, state: string) => {
  if (!games[code]) return;

  const game = games[code];
  const attacker = game.players.attacker;
  const defender = game.players.defender;

  const message: WsMessageType = {
    state,
    data: state === 'players' ? JSON.stringify(game.players) : (game.state[state] ?? ''),
  };

  const messageJson = JSON.stringify(message);

  if (attacker) clients[attacker].send(messageJson);
  if (defender) clients[defender].send(messageJson);
};

const handleMessage = (bytes: WebSocket.RawData, code: string) => {
  if (!games[code]) return;

  const message = JSON.parse(bytes.toString()) as WsMessageType;
  const game = games[code];

  game.state[message.state] = message.data;
  broadcast(code, message.state);
};

const handleClose = (code: string) => {
  if (!games[code]) return;

  const attacker = games[code].players.attacker;
  const defender = games[code].players.defender;

  if (attacker) {
    delete clients[attacker];
    games[code].players.attacker = null;
  }

  if (defender) {
    delete clients[defender];
    games[code].players.defender = null;
  }

  if (!games[code].players.attacker && !games[code].players.defender) delete games[code];

  broadcast(code, 'players');
};

export function SOCKET(client: WebSocket, request: IncomingMessage) {
  const query = queryString.parseUrl(request.url ?? '').query;
  const code = query.code as string | null;
  if (!code) return client.close(4000, 'no game code provided');

  const userId = query.user as string | null;
  if (!userId) return client.close(4000, 'no user id provided');

  const role = query.role as string | null;
  if (!role) return client.close(4000, 'no role provided');
  if (role !== 'attacker' && role !== 'defender') return client.close(4000, 'invalid role provided');

  clients[userId] = client;
  games[code] = {
    players: {
      attacker: role === 'attacker' ? userId : (games[code]?.players.attacker ?? null),
      defender: role === 'defender' ? userId : (games[code]?.players.defender ?? null),
    },
    state: {},
  };

  broadcast(code, 'players');
  client.on('message', (bytes) => handleMessage(bytes, code));
  client.on('close', () => handleClose(code));
}
