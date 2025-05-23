import { LucideIcon } from 'lucide-react';

import { TOPOLOGY, TOPOLOGY_NODE_DEFENSES } from '@/constant/topology';

export type TopologyNodeType = {
  id: string;
  stolenToken: number;
  revealed: boolean;
  defenses: TopologyDefenseType[];
  selected: {
    attacker: boolean;
    defender: boolean;
  };
};

export type TopologyNodeDetailType = {
  id: string;
  name: string;
  token: number;
  security: 'low' | 'medium' | 'high';
  icon: LucideIcon;
  x: number;
  y: number;
};

export type TopologyLinkType = {
  source: string;
  target: string;
};

export type TopologyDefenseType = {
  id: string;
  revealed: boolean;
};

export type TopologyType = {
  nodes: TopologyNodeType[];
  links: TopologyLinkType[];
};

export type TopologyDetailType = {
  nodes: TopologyNodeDetailType[];
  links: TopologyLinkType[];
};

export const defaultTopology: TopologyType = {
  nodes: TOPOLOGY.nodes.map((node) => ({
    id: node.id,
    stolenToken: 0,
    revealed: false,
    // TODO: change defense back to []
    defenses: TOPOLOGY_NODE_DEFENSES[node.id] ?? [],
    selected: {
      attacker: false,
      defender: false,
    },
  })),
  links: TOPOLOGY.links,
};

export const getTopologyNodeById = (id?: string): TopologyNodeDetailType | undefined => {
  if (!id) return undefined;

  const node = TOPOLOGY.nodes.find((node) => node.id === id);

  return node;
};
