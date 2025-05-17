import { LucideIcon } from 'lucide-react';

import { TOPOLOGY } from '@/constant/topology';

export type TopologyNodeType = {
  id: string;
  name: string;
  icon: LucideIcon;
  token: number;
  stolenToken: number;
  security: 'low' | 'medium' | 'high';
  revealed: boolean;
  defenses: string[];
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

export const generateTopology = () => {
  return TOPOLOGY;
};
