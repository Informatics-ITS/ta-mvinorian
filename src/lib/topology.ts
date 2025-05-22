import { LucideIcon } from 'lucide-react';

import { TOPOLOGY } from '@/constant/topology';

export type TopologyNodeType = {
  id: string;
  stolenToken: number;
  revealed: boolean;
  defenses: string[];
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
    defenses: [],
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
