import { LucideIcon } from 'lucide-react';

import { GAME_TOPOLOGY, GAME_TOPOLOGY_NODE_DEFENSES } from '@/constant/game-topology';

export type GameNodeType = {
  id: string;
  name: string;
  token: number;
  security: 'low' | 'medium' | 'high';
  education: string;
  icon: LucideIcon;
  x: number;
  y: number;
};

export type GameNodePlayerType = {
  id: string;
  selected: boolean;
};

export type GameTopologyDefenseType = {
  id: string;
  revealed: boolean;
};

export type GameTopologyNodeType = {
  id: string;
  stolenToken: number;
  revealed: boolean;
  defenses: GameTopologyDefenseType[];
};

export type GameTopologyLinkType = {
  source: string;
  target: string;
};

export type GameTopologyType = {
  nodes: GameTopologyNodeType[];
  links: GameTopologyLinkType[];
};

export type TopologyType = {
  nodes: GameNodeType[];
  links: GameTopologyLinkType[];
};

export const defaultGameNodePlayer: GameNodePlayerType[] = GAME_TOPOLOGY.nodes.map((node) => ({
  id: node.id,
  selected: false,
}));

export const defaultGameTopology: GameTopologyType = {
  nodes: GAME_TOPOLOGY.nodes.map((node) => ({
    id: node.id,
    stolenToken: 0,
    revealed: false,
    defenses: GAME_TOPOLOGY_NODE_DEFENSES[node.id] ?? [],
  })),
  links: GAME_TOPOLOGY.links,
};

export const getGameNodeById = (nodeId?: string): GameNodeType | undefined => {
  if (!nodeId) return undefined;

  const node = GAME_TOPOLOGY.nodes.find((node) => node.id === nodeId);
  return node;
};

export const getGameNodePlayerById = (
  playerNodes: GameNodePlayerType[],
  nodeId?: string,
): GameNodePlayerType | undefined => {
  if (!nodeId) return undefined;
  const playerNode = playerNodes.find((node) => node.id === nodeId);
  return playerNode;
};

export const getGameTopologyNodeById = (
  topology: GameTopologyType,
  nodeId?: string,
): GameTopologyNodeType | undefined => {
  if (!nodeId) return undefined;

  const node = topology.nodes.find((node) => node.id === nodeId);
  return node;
};
