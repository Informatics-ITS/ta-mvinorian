import {
  FlameIcon,
  FolderLockIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  ListFilterIcon,
  RadarIcon,
  ScanSearchIcon,
  UmbrellaIcon,
} from 'lucide-react';

import { GameDefenseType } from '@/lib/game-defense';

export const GAME_DEFENSES: GameDefenseType[] = [
  {
    id: 'd-firewall',
    name: 'Firewall',
    icon: FlameIcon,
    color: {
      primary: 'bg-red-700',
      secondary: 'bg-red-600',
      accent: 'text-red-100',
      strong: 'text-red-1000',
    },
  },
  {
    id: 'd-ids',
    name: 'IDS',
    icon: RadarIcon,
    color: {
      primary: 'bg-blue-700',
      secondary: 'bg-blue-600',
      accent: 'text-blue-100',
      strong: 'text-blue-1000',
    },
  },
  {
    id: 'd-antivirus',
    name: 'Antivirus',
    icon: UmbrellaIcon,
    color: {
      primary: 'bg-red-700',
      secondary: 'bg-red-600',
      accent: 'text-red-100',
      strong: 'text-red-1000',
    },
  },
  {
    id: 'd-network-segmentation',
    name: 'Network Segmentation',
    icon: LayoutGridIcon,
    color: {
      primary: 'bg-teal-700',
      secondary: 'bg-teal-600',
      accent: 'text-teal-100',
      strong: 'text-teal-1000',
    },
  },
  {
    id: 'd-anomaly-detection',
    name: 'Anomaly Detection',
    icon: ScanSearchIcon,
    color: {
      primary: 'bg-blue-700',
      secondary: 'bg-blue-600',
      accent: 'text-blue-100',
      strong: 'text-blue-1000',
    },
  },
  {
    id: 'd-spam-filter',
    name: 'Spam Filter',
    icon: ListFilterIcon,
    color: {
      primary: 'bg-blue-700',
      secondary: 'bg-blue-600',
      accent: 'text-blue-100',
      strong: 'text-blue-1000',
    },
  },
  {
    id: 'd-encryption',
    name: 'Encryption',
    icon: FolderLockIcon,
    color: {
      primary: 'bg-teal-700',
      secondary: 'bg-teal-600',
      accent: 'text-teal-100',
      strong: 'text-teal-1000',
    },
  },
  {
    id: 'd-mfa',
    name: 'MFA',
    icon: KeyRoundIcon,
    color: {
      primary: 'bg-red-700',
      secondary: 'bg-red-600',
      accent: 'text-red-100',
      strong: 'text-red-1000',
    },
  },
];
