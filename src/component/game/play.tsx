import React from 'react';

import { cn } from '@/lib/utils';

import { GameBoard } from './board';
import { GameDeck } from './deck';
import { GameFloating } from './floating';
import { GameSideLeft } from './side-left';
import { GameSideRight } from './side-right';

export interface GamePlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GamePlay = React.forwardRef<HTMLDivElement, GamePlayProps>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex h-full w-full overflow-clip', className)} {...props}>
      <GameSideLeft className='z-30' />
      <div className='relative h-full flex-1'>
        <GameFloating />
        <GameBoard />
        <GameDeck />
      </div>
      <GameSideRight className='z-30' />
    </div>
  );
});
