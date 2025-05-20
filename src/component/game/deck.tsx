import * as motion from 'motion/react-client';
import React from 'react';

import { getGameCardById } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { useGameEngineContext } from '@/provider/game-engine-provider';

import { Button } from '../ui/button';
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
          <motion.div
            key={card.id}
            variants={cardAnimation}
            initial='initial'
            animate={card.selected ? 'animate' : 'initial'}
            whileHover='animate'
            className='flex shrink-0 justify-center focus-visible:outline-none'
          >
            <GameCard card={getGameCardById(card.id)!} onClick={() => handleClick(card.id)} className='relative' />
            {card.selected && (
              <div className='absolute z-20 flex h-72 w-52 shrink-0 flex-col items-center overflow-clip rounded-xl transition-all duration-300'>
                <Button
                  size='lg'
                  variant='ghost'
                  className='!text-label-20 hover:bg-background-100 hover:border-background-100 relative z-20 mt-[72px] border border-gray-400 text-gray-100'
                >
                  Use Card
                </Button>
                <div
                  className='bg-gray-1000 absolute right-0 left-0 h-full w-full opacity-40'
                  onClick={() => handleClick(card.id)}
                ></div>
              </div>
            )}
          </motion.div>
        ))}

      <div className='absolute top-0 right-0 flex h-full items-end pr-4 pb-[108px]'>
        <Button className='mb-4'>End Turn</Button>
      </div>
    </div>
  );
});
