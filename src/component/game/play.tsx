import React from 'react';

import { cn } from '@/lib/utils';

import { GameBoard } from './board';
import { GameDeck } from './deck';
import { GameSide } from './side';

export interface GamePlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GamePlay = React.forwardRef<HTMLDivElement, GamePlayProps>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex h-full w-full overflow-clip', className)} {...props}>
      <GameSide className='z-30' />
      <div className='relative h-full flex-1'>
        <GameBoard />
        <GameDeck />
      </div>
    </div>
  );
});
