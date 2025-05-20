import * as motion from 'motion/react-client';
import React from 'react';

import { getGameCardById } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { useGameEngineContext } from '@/provider/game-engine-provider';

import { GameCard } from './card';

export interface GameDeckProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameDeck = React.forwardRef<HTMLDivElement, GameDeckProps>(({ className, ...props }, ref) => {
  const { role, deck, setDeck } = useGameEngineContext();

  const handleClick = (cardId: string) => {
    if (!deck || !role) return;
    const newDeck = {
      ...deck,
      [role]: deck[role].map((card) =>
        card.id === cardId ? { ...card, selected: !card.selected } : { ...card, selected: false },
      ),
    };
    setDeck(newDeck);
  };

  const cardAnimation = {
    initial: { scale: 1, y: 0 },
    animate: { scale: 1.2, y: -132, width: '264px' },
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background-100 absolute bottom-0 left-0 z-10 flex w-full translate-y-[108px] justify-center gap-4 border-t border-gray-400 p-4',
        className,
      )}
      {...props}
    >
      {deck &&
        role &&
        deck[role].map((card) => (
          <motion.button
            key={card.id}
            variants={cardAnimation}
            initial='initial'
            animate={card.selected ? 'animate' : 'initial'}
            whileHover='animate'
            onClick={() => handleClick(card.id)}
            className='flex shrink-0 justify-center focus-visible:outline-none'
          >
            <GameCard card={getGameCardById(card.id)!} />
          </motion.button>
        ))}
    </div>
  );
});
