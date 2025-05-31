import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { GameNodeType, GameTopologyNodeType, getGameNodeById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { GameRoleType } from '@/provider/game-state-provider';

import { GameDefense, GameDefenseEmpty, GameDefenseHidden } from './defense';

export const nodeAttribute: {
  [k in GameNodeType['security']]: {
    bg: string;
    icon: React.ReactNode;
    text: string;
    strong: string;
    accent: string;
    stroke: string;
  };
} = {
  low: {
    bg: 'bg-red-700',
    icon: <_SecurityLowIcon />,
    text: 'text-red-100',
    strong: 'text-red-700',
    accent: 'bg-red-600',
    stroke: 'border-red-500',
  },
  medium: {
    bg: 'bg-amber-700',
    icon: <_SecurityMediumIcon />,
    text: 'text-amber-100',
    strong: 'text-amber-700',
    accent: 'bg-amber-600',
    stroke: 'border-amber-500',
  },
  high: {
    bg: 'bg-purple-700',
    icon: <_SecurityHighIcon />,
    text: 'text-purple-100',
    strong: 'text-purple-700',
    accent: 'bg-purple-600',
    stroke: 'border-purple-500',
  },
};

export interface GameNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  node: GameTopologyNodeType;
  role: GameRoleType;
}

export const GameNode = React.forwardRef<HTMLDivElement, GameNodeProps>(({ node, role, className, ...props }, ref) => {
  const gameNode = getGameNodeById(node.id);
  if (!gameNode) return null;

  const NodeIcon = gameNode.icon;

  return (
    <div
      ref={ref}
      className={cn('bg-background-100 shadow-card h-72 w-52 shrink-0 rounded-xl p-1.5', className)}
      {...props}
    >
      <div className={cn('h-full w-full space-y-3 rounded-lg p-2', nodeAttribute[gameNode.security].bg)}>
        <div className='relative flex h-36 w-full items-center justify-center overflow-clip rounded-md'>
          <div
            className={cn(
              'absolute -top-1 -left-0.5 rounded-md p-2',
              nodeAttribute[gameNode.security].bg,
              nodeAttribute[gameNode.security].text,
            )}
          >
            {nodeAttribute[gameNode.security].icon}
          </div>

          <NodeIcon className={cn('z-10 h-24 w-24', nodeAttribute[gameNode.security].strong)} strokeWidth={1.25} />

          {(role === 'attacker' && node.revealed === true) || role === 'defender' ? (
            <div className='absolute top-1.5 right-1.5 z-10 space-y-1.5'>
              {Array.from({ length: gameNode.token - node.stolenToken }, (_, i) => (
                <_ActiveDataToken key={i} />
              ))}
              {Array.from({ length: node.stolenToken }, (_, i) => (
                <_StolenDataToken key={i} />
              ))}
            </div>
          ) : (
            <div className='absolute top-1.5 right-1.5 z-10 space-y-1.5'>
              <_LockedDataToken />
            </div>
          )}

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
        <div className='space-y-4 px-1 text-left'>
          <p className={cn('!text-label-16 font-semibold', nodeAttribute[gameNode.security].text)}>{gameNode.name}</p>
          <div className='grid grid-cols-3 gap-2'>
            <AnimatePresence mode='wait'>
              {node.defenses.map((defense, index) =>
                role === 'attacker' && !defense.revealed ? (
                  <motion.div
                    key={'defense' + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <GameDefenseHidden />
                  </motion.div>
                ) : (
                  <motion.div
                    key={'defense' + defense.id + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <GameDefense defense={defense} />
                  </motion.div>
                ),
              )}
              {Array.from({ length: 3 - node.defenses.length }, (_, index) =>
                role === 'attacker' ? (
                  <motion.div
                    key={'placeholder' + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <GameDefenseHidden />
                  </motion.div>
                ) : (
                  <motion.div
                    key={'placeholder' + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <GameDefenseEmpty
                      key={index}
                      className={cn(nodeAttribute[gameNode.security].accent, nodeAttribute[gameNode.security].stroke)}
                    />
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
});

export { _ActiveDataToken as ActiveDataToken };

function _SecurityHighIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17 12.0004C17 17.0004 13.5 19.5005 9.34 20.9505C9.12216 21.0243 8.88554 21.0207 8.67 20.9405C4.5 19.5005 1 17.0004 1 12.0004V5.00045C1 4.73523 1.10536 4.48088 1.29289 4.29334C1.48043 4.10581 1.73478 4.00045 2 4.00045C4 4.00045 6.5 2.80045 8.24 1.28045C8.45185 1.09945 8.72135 1 9 1C9.27865 1 9.54815 1.09945 9.76 1.28045C11.51 2.81045 14 4.00045 16 4.00045C16.2652 4.00045 16.5196 4.10581 16.7071 4.29334C16.8946 4.48088 17 4.73523 17 5.00045V12.0004Z'
        stroke='#F9F0FF'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M6 7.00046V15.0005' stroke='#F9F0FF' strokeWidth='2' strokeLinecap='round' />
      <path d='M12 7.00046V15.0005' stroke='#F9F0FF' strokeWidth='2' strokeLinecap='round' />
      <path d='M12 11.0005L6 11.0005' stroke='#F9F0FF' strokeWidth='2' strokeLinecap='round' />
    </svg>
  );
}

function _SecurityMediumIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17 12.0004C17 17.0004 13.5 19.5005 9.34 20.9505C9.12216 21.0243 8.88554 21.0207 8.67 20.9405C4.5 19.5005 1 17.0004 1 12.0004V5.00045C1 4.73523 1.10536 4.48088 1.29289 4.29334C1.48043 4.10581 1.73478 4.00045 2 4.00045C4 4.00045 6.5 2.80045 8.24 1.28045C8.45185 1.09945 8.72135 1 9 1C9.27865 1 9.54815 1.09945 9.76 1.28045C11.51 2.81045 14 4.00045 16 4.00045C16.2652 4.00045 16.5196 4.10581 16.7071 4.29334C16.8946 4.48088 17 4.73523 17 5.00045V12.0004Z'
        stroke='#FFF6E6'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M6 7.00046V15.0005' stroke='#FFF6E6' strokeWidth='2' strokeLinecap='round' />
      <path d='M12 7.00046V15.0005' stroke='#FFF6E6' strokeWidth='2' strokeLinecap='round' />
      <path d='M9 10.0005L6 7.00046' stroke='#FFF6E6' strokeWidth='2' strokeLinecap='round' />
      <path d='M9 10.0005L12 7.00046' stroke='#FFF6E6' strokeWidth='2' strokeLinecap='round' />
    </svg>
  );
}

function _SecurityLowIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17 12.0004C17 17.0004 13.5 19.5005 9.34 20.9505C9.12216 21.0243 8.88554 21.0207 8.67 20.9405C4.5 19.5005 1 17.0004 1 12.0004V5.00045C1 4.73523 1.10536 4.48088 1.29289 4.29334C1.48043 4.10581 1.73478 4.00045 2 4.00045C4 4.00045 6.5 2.80045 8.24 1.28045C8.45185 1.09945 8.72135 1 9 1C9.27865 1 9.54815 1.09945 9.76 1.28045C11.51 2.81045 14 4.00045 16 4.00045C16.2652 4.00045 16.5196 4.10581 16.7071 4.29334C16.8946 4.48088 17 4.73523 17 5.00045V12.0004Z'
        stroke='#FFF0F0'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M6 7.00046V15.0005' stroke='#FFF0F0' strokeWidth='2' strokeLinecap='round' />
      <path d='M12 15.0005L6 15.0005' stroke='#FFF0F0' strokeWidth='2' strokeLinecap='round' />
    </svg>
  );
}

function _ActiveDataToken() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M21.0017 11C21.0017 16.5228 16.5246 21 11.0017 21C5.47886 21 1.00171 16.5228 1.00171 11C1.00171 5.47715 5.47886 1 11.0017 1C16.5246 1 21.0017 5.47715 21.0017 11ZM8.00171 9C8.00171 8.44772 8.44942 8 9.00171 8H13.0017C13.554 8 14.0017 8.44772 14.0017 9V13C14.0017 13.5523 13.554 14 13.0017 14H9.00171C8.44942 14 8.00171 13.5523 8.00171 13V9Z'
        fill='#FFC96B'
      />
      <path
        d='M11.0017 22C17.0768 22 22.0017 17.0751 22.0017 11H20.0017C20.0017 15.9706 15.9723 20 11.0017 20V22ZM0.00170898 11C0.00170898 17.0751 4.92658 22 11.0017 22V20C6.03115 20 2.00171 15.9706 2.00171 11H0.00170898ZM11.0017 0C4.92658 0 0.00170898 4.92487 0.00170898 11H2.00171C2.00171 6.02944 6.03115 2 11.0017 2V0ZM22.0017 11C22.0017 4.92487 17.0768 0 11.0017 0V2C15.9723 2 20.0017 6.02944 20.0017 11H22.0017ZM9.00171 7C7.89714 7 7.00171 7.89543 7.00171 9H9.00171V7ZM13.0017 7H9.00171V9H13.0017V7ZM15.0017 9C15.0017 7.89543 14.1063 7 13.0017 7V9H15.0017ZM15.0017 13V9H13.0017V13H15.0017ZM13.0017 15C14.1063 15 15.0017 14.1046 15.0017 13H13.0017V15ZM9.00171 15H13.0017V13H9.00171V15ZM7.00171 13C7.00171 14.1046 7.89714 15 9.00171 15V13H7.00171ZM7.00171 9V13H9.00171V9H7.00171Z'
        fill='#FFB224'
      />
    </svg>
  );
}

function _StolenDataToken() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M9.10229 1.18216C10.3573 0.93928 11.6473 0.93928 12.9023 1.18216'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.9023 20.8182C11.6473 21.0611 10.3573 21.0611 9.10229 20.8182'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16.6111 2.72119C17.6726 3.44041 18.5858 4.35706 19.3011 5.42119'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M1.18411 12.9002C0.941233 11.6451 0.941233 10.3552 1.18411 9.10016'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.2813 17C18.5621 18.0615 17.6454 18.9747 16.5813 19.69'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.8203 9.10016C21.0632 10.3552 21.0632 11.6451 20.8203 12.9002'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.72314 5.39117C3.44237 4.3297 4.35901 3.41645 5.42314 2.70117'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.39312 19.2792C4.33166 18.5599 3.4184 17.6433 2.70312 16.5792'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

const _LockedDataToken = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M9.10034 1.18216C10.3554 0.93928 11.6453 0.93928 12.9003 1.18216'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.9003 20.8182C11.6453 21.0611 10.3554 21.0611 9.10034 20.8182'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16.6091 2.72119C17.6706 3.44041 18.5839 4.35706 19.2991 5.42119'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M1.18216 12.9002C0.93928 11.6451 0.93928 10.3552 1.18216 9.10016'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.2793 17C18.5601 18.0615 17.6435 18.9747 16.5793 19.69'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.8184 9.10016C21.0612 10.3552 21.0612 11.6451 20.8184 12.9002'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.72119 5.39117C3.44041 4.3297 4.35706 3.41645 5.42119 2.70117'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.39117 19.2792C4.3297 18.5599 3.41645 17.6433 2.70117 16.5792'
        stroke='#FFB224'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.22222 9.4V7.75C8.22222 7.02065 8.51488 6.32118 9.03581 5.80546C9.55675 5.28973 10.2633 5 11 5C11.7367 5 12.4433 5.28973 12.9642 5.80546C13.4851 6.32118 13.7778 7.02065 13.7778 7.75V9.4M11.5556 12.7C11.5556 13.0038 11.3068 13.25 11 13.25C10.6932 13.25 10.4444 13.0038 10.4444 12.7C10.4444 12.3962 10.6932 12.15 11 12.15C11.3068 12.15 11.5556 12.3962 11.5556 12.7ZM7.11111 9.4H14.8889C15.5025 9.4 16 9.89249 16 10.5V14.9C16 15.5075 15.5025 16 14.8889 16H7.11111C6.49746 16 6 15.5075 6 14.9V10.5C6 9.89249 6.49746 9.4 7.11111 9.4Z'
        stroke='#FFB224'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
