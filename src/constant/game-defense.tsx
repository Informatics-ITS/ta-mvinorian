import {
  BrickWallFireIcon,
  FolderLockIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  ListFilterIcon,
  RadarIcon,
  ScanSearchIcon,
  UmbrellaIcon,
} from 'lucide-react';

import { GameDefenseType } from '@/lib/game-defense';

//? placeholder translation function
const t = (key: string) => key;

export const GAME_DEFENSES: GameDefenseType[] = [
  {
    id: 'd-firewall',
    alias: 'Firewall',
    name: 'Firewall',
    desc: t('game-defense.firewall-desc'),
    education: t('game-defense.firewall-edu'),
    icon: BrickWallFireIcon,
    color: {
      primary: 'bg-red-700',
      secondary: 'bg-red-600',
      accent: 'text-red-100',
      strong: 'text-red-1000',
    },
  },
  {
    id: 'd-ids',
    alias: 'Intrusion Detection System',
    name: 'IDS',
    desc: t('game-defense.ids-desc'),
    education: t('game-defense.ids-edu'),
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
    alias: 'Antivirus',
    name: 'Antivirus',
    desc: t('game-defense.antivirus-desc'),
    education: t('game-defense.antivirus-edu'),
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
    alias: 'Network Segmentation',
    name: 'Network Segmentation',
    desc: t('game-defense.network-segmentation-desc'),
    education: t('game-defense.network-segmentation-edu'),
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
    alias: 'Anomaly Detection',
    name: 'Anomaly Detection',
    desc: t('game-defense.anomaly-detection-desc'),
    education: t('game-defense.anomaly-detection-edu'),
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
    alias: 'Spam Filter',
    name: 'Spam Filter',
    desc: t('game-defense.spam-filter-desc'),
    education: t('game-defense.spam-filter-edu'),
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
    alias: 'Encryption',
    name: 'Encryption',
    desc: t('game-defense.encryption-desc'),
    education: t('game-defense.encryption-edu'),
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
    alias: 'Multi-Factor Authentication',
    name: 'MFA',
    desc: t('game-defense.mfa-desc'),
    education: t('game-defense.mfa-edu'),
    icon: KeyRoundIcon,
    color: {
      primary: 'bg-red-700',
      secondary: 'bg-red-600',
      accent: 'text-red-100',
      strong: 'text-red-1000',
    },
  },
];
