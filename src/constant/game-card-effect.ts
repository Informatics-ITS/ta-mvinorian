import { GameCardEffectType } from '@/lib/game-card-effect';

export const GAME_CARD_EFFECTS: Record<string, GameCardEffectType> = {
  'caa-sql-injection': {
    nodes: ['nh-database-server', 'nm-web-server'],
    stealTokens: 1,
  },
  'cdb-firewall-upgrade': {
    nodes: ['nh-database-server', 'nm-web-server'],
    addDefense: 'd-firewall',
  },
};
