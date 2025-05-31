import { GameCardEffectType } from '@/lib/game-card-effect';

export const GAME_CARD_EFFECTS: Record<string, GameCardEffectType> = {
  'caa-sql-injection': {
    nodes: ['nh-database-server', 'nm-web-server'],
    stealTokens: 1,
  },
  'caa-phishing-attack': {
    nodes: ['nl-workstation'],
    stealTokens: 1,
  },
  'caa-zero-day-exploit': {
    nodes: ['all'],
    stealTokens: 1,
    ignoredDefenses: 1,
  },

  'cdb-firewall-upgrade': {
    nodes: ['nh-database-server', 'nm-web-server'],
    addDefense: 'd-firewall',
  },
  'cdb-mfa-implementation': {
    nodes: ['nm-email-server', 'nl-workstation'],
    addDefense: 'd-mfa',
  },
  'cdb-network-segmentation': {
    nodes: ['all'],
    ignoreAttack: true,
  },
};
