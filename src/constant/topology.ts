import { CloudIcon, CpuIcon, DatabaseIcon, GlobeIcon, MailIcon, MonitorIcon, NetworkIcon } from 'lucide-react';

import { TopologyDefenseType, TopologyDetailType } from '@/lib/topology';

export const TOPOLOGY: TopologyDetailType = {
  nodes: [
    {
      id: 'NH002',
      name: 'Internal Network Hub',
      token: 0,
      security: 'high',
      icon: NetworkIcon,
      x: 290,
      y: 370,
    },
    {
      id: 'NH001',
      name: 'Database Server',
      token: 2,
      security: 'high',
      icon: DatabaseIcon,
      x: 0,
      y: 370,
    },
    {
      id: 'NM001',
      name: 'Web Server',
      token: 1,
      security: 'medium',
      icon: GlobeIcon,
      x: 0,
      y: 0,
    },
    {
      id: 'NM003',
      name: 'Cloud Storage',
      token: 2,
      security: 'medium',
      icon: CloudIcon,
      x: 290,
      y: 0,
    },
    {
      id: 'NL002',
      name: 'IoT Device',
      token: 0,
      security: 'low',
      icon: CpuIcon,
      x: 580,
      y: 370,
    },
    {
      id: 'NM002',
      name: 'Email Server',
      token: 1,
      security: 'medium',
      icon: MailIcon,
      x: 290,
      y: 740,
    },
    {
      id: 'NL001',
      name: 'Workstation',
      token: 1,
      security: 'low',
      icon: MonitorIcon,
      x: 580,
      y: 740,
    },
  ],
  links: [
    {
      source: 'NH002',
      target: 'NM003',
    },
    {
      source: 'NH002',
      target: 'NM001',
    },
    {
      source: 'NH002',
      target: 'NL001',
    },
    {
      source: 'NH002',
      target: 'NL002',
    },
    {
      source: 'NH002',
      target: 'NM002',
    },
    {
      source: 'NH001',
      target: 'NM001',
    },
  ],
};

export const TOPOLOGY_NODE_DEFENSES: Record<string, TopologyDefenseType[]> = {
  NH001: [
    { id: 'D0001', revealed: false },
    { id: 'D0002', revealed: false },
  ],
  NH002: [
    { id: 'D0004', revealed: false },
    { id: 'D0005', revealed: false },
  ],
  NM001: [{ id: 'D0001', revealed: false }],
  NM003: [
    { id: 'D0007', revealed: false },
    { id: 'D0008', revealed: false },
  ],
  NM002: [
    { id: 'D0006', revealed: false },
    { id: 'D0007', revealed: false },
  ],
  NL001: [{ id: 'D0003', revealed: false }],
};
