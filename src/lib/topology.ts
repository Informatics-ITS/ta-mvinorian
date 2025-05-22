import { LucideIcon } from 'lucide-react';

import { TOPOLOGY } from '@/constant/topology';

export type TopologyNodeType = {
  id: string;
  name: string;
  token: number;
  security: 'low' | 'medium' | 'high';
  icon: LucideIcon;
  stolenToken: number;
  revealed: boolean;
  defenses: string[];
  x: number;
  y: number;
  selected: {
    attacker: boolean;
    defender: boolean;
  };
};

export type TopologyLinkType = {
  source: string;
  target: string;
};

export type TopologyType = {
  nodes: TopologyNodeType[];
  links: TopologyLinkType[];
};

export const defaultTopology: TopologyType = TOPOLOGY;

export const getTopologyNodeById = (id: string): TopologyNodeType | undefined => {
  const node = TOPOLOGY.nodes.find((node) => node.id === id);

  return node;
};
