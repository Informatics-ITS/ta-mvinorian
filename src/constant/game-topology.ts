import { CloudIcon, CpuIcon, DatabaseIcon, GlobeIcon, MailIcon, MonitorIcon, NetworkIcon } from 'lucide-react';

import { GameTopologyDefenseType, TopologyType } from '@/lib/game-topology';

export const GAME_TOPOLOGY: TopologyType = {
  nodes: [
    {
      id: 'nh-internal-network-hub',
      name: 'Internal Network Hub',
      token: 0,
      security: 'high',
      education: 'game-node.internal-network-hub',
      icon: NetworkIcon,
      x: 290,
      y: 370,
    },
    {
      id: 'nh-database-server',
      name: 'Database Server',
      token: 2,
      security: 'high',
      education: 'game-node.database-server',
      icon: DatabaseIcon,
      x: 0,
      y: 370,
    },
    {
      id: 'nm-web-server',
      name: 'Web Server',
      token: 1,
      security: 'medium',
      education: 'game-node.web-server',
      icon: GlobeIcon,
      x: 0,
      y: 0,
    },
    {
      id: 'nm-cloud-storage',
      name: 'Cloud Storage',
      token: 2,
      security: 'medium',
      education: 'game-node.cloud-storage',
      icon: CloudIcon,
      x: 290,
      y: 0,
    },
    {
      id: 'nl-iot-device',
      name: 'IoT Device',
      token: 0,
      security: 'low',
      education: 'game-node.iot-device',
      icon: CpuIcon,
      x: 580,
      y: 370,
    },
    {
      id: 'nm-email-server',
      name: 'Email Server',
      token: 1,
      security: 'medium',
      education: 'game-node.email-server',
      icon: MailIcon,
      x: 290,
      y: 740,
    },
    {
      id: 'nl-workstation',
      name: 'Workstation',
      token: 1,
      security: 'low',
      education: 'game-node.workstation',
      icon: MonitorIcon,
      x: 580,
      y: 740,
    },
  ],
  links: [
    {
      source: 'nh-internal-network-hub',
      target: 'nm-cloud-storage',
    },
    {
      source: 'nh-internal-network-hub',
      target: 'nh-database-server',
    },
    {
      source: 'nh-internal-network-hub',
      target: 'nl-iot-device',
    },
    {
      source: 'nh-internal-network-hub',
      target: 'nm-email-server',
    },
    {
      source: 'nh-internal-network-hub',
      target: 'nl-workstation',
    },
    {
      source: 'nh-database-server',
      target: 'nm-web-server',
    },
  ],
};

export const GAME_TOPOLOGY_NODE_DEFENSES: Record<string, GameTopologyDefenseType[]> = {
  'nh-database-server': [
    { id: 'd-firewall', revealed: false },
    { id: 'd-ids', revealed: false },
  ],
  'nh-internal-network-hub': [
    { id: 'd-network-segmentation', revealed: false },
    { id: 'd-anomaly-detection', revealed: false },
  ],
  'nm-web-server': [{ id: 'd-firewall', revealed: false }],
  'nm-email-server': [
    { id: 'd-encryption', revealed: false },
    { id: 'd-mfa', revealed: false },
  ],
  'nm-cloud-storage': [
    { id: 'd-spam-filter', revealed: false },
    { id: 'd-encryption', revealed: false },
  ],
  'nl-workstation': [{ id: 'd-antivirus', revealed: false }],
};
