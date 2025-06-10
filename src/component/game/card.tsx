import {
  CrossIcon,
  EyeOffIcon,
  LucideIcon,
  MousePointerClickIcon,
  ScanEyeIcon,
  ShieldIcon,
  SwordIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { GameCardType } from '@/lib/game-card';
import { cn } from '@/lib/utils';

export const cardAttribute: {
  [k in GameCardType['type']]: {
    bg: string;
    icon: LucideIcon;
    text: string;
    strong: string;
    accent: string;
  };
} = {
  stealth: {
    bg: 'bg-purple-700',
    icon: EyeOffIcon,
    text: 'text-purple-100',
    strong: 'text-purple-700',
    accent: 'text-purple-500',
  },
  attack: {
    bg: 'bg-red-700',
    icon: SwordIcon,
    text: 'text-red-100',
    strong: 'text-red-700',
    accent: 'text-red-500',
  },
  disrupt: {
    bg: 'bg-teal-700',
    icon: MousePointerClickIcon,
    text: 'text-teal-100',
    strong: 'text-teal-700',
    accent: 'text-teal-500',
  },
  block: {
    bg: 'bg-blue-700',
    icon: ShieldIcon,
    text: 'text-blue-100',
    strong: 'text-blue-700',
    accent: 'text-blue-500',
  },
  detect: {
    bg: 'bg-pink-700',
    icon: ScanEyeIcon,
    text: 'text-pink-100',
    strong: 'text-pink-700',
    accent: 'text-pink-500',
  },
  recover: {
    bg: 'bg-green-700',
    icon: CrossIcon,
    text: 'text-green-100',
    strong: 'text-green-700',
    accent: 'text-green-500',
  },
};

export interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: GameCardType;
}

export const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(({ card, className, ...props }, ref) => {
  const t = useTranslations();

  const GameCardTypeIcon = cardAttribute[card.type].icon;
  const GameCardIcon = card.icon;

  return (
    <div
      ref={ref}
      className={cn('bg-background-100 shadow-card h-72 w-52 shrink-0 rounded-xl p-1.5 select-none', className)}
      {...props}
    >
      <div className={cn('h-full w-full space-y-3 rounded-lg p-2', cardAttribute[card.type].bg)}>
        <div className='relative flex h-32 w-full items-center justify-center overflow-clip rounded-md'>
          <div
            className={cn(
              'absolute -top-1 -left-1 rounded-md p-2',
              cardAttribute[card.type].bg,
              cardAttribute[card.type].text,
            )}
          >
            <GameCardTypeIcon />
          </div>

          <GameCardIcon className={cn('z-10 h-20 w-20', cardAttribute[card.type].strong)} strokeWidth={1.25} />

          <svg
            className='absolute top-0 left-0 z-0 h-full w-full object-fill'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g filter='url(#filter0_i_2025_34)'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M6 36C2.68629 36 0 38.6863 0 42V142C0 145.314 2.68629 148 6 148H176C179.314 148 182 145.314 182 142V6C182 2.68629 179.314 0 176 0H42C38.6863 0 36 2.68629 36 6V30C36 33.3137 33.3137 36 30 36H6Z'
                fill='white'
              />
            </g>
            <defs>
              <filter
                id='filter0_i_2025_34'
                x='0'
                y='0'
                width='182'
                height='148'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'
              >
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feColorMatrix
                  in='SourceAlpha'
                  type='matrix'
                  values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                  result='hardAlpha'
                />
                <feOffset />
                <feGaussianBlur stdDeviation='2' />
                <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
                <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
                <feBlend mode='normal' in2='shape' result='effect1_innerShadow_2025_34' />
              </filter>
            </defs>
          </svg>
        </div>
        <div className='space-y-2 px-1 text-left'>
          <p className={cn('!text-label-16 font-semibold', cardAttribute[card.type].text)}>{card.name}</p>
          <p className={cn('!text-label-12', cardAttribute[card.type].accent)}>{t(card.desc as any)}</p>
        </div>
      </div>
    </div>
  );
});
