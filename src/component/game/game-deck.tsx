import * as motion from 'motion/react-client';
import React from 'react';

import { GameDeckType, getGameDeckDetails } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { GameEngineType } from '@/provider/game-engine-provider';

import { GameCard } from './game-card';

export interface GameDeckProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  deck: GameEngineType['deck'];
  role: GameEngineType['role'];
  setDeck: (deck: GameDeckType) => void;
}

export const GameDeck = React.forwardRef<HTMLDivElement, GameDeckProps>(
  ({ deck, setDeck, role, className, ...props }, ref) => {
    const deckDetails = getGameDeckDetails(deck!, role!);

    const cardAnimation = {
      initial: { scale: 1, y: 0 },
      animate: { scale: 1.2, y: -132, width: '264px' },
    };

    const onClickCard = (cardId: string) => {
      if (!deck || !role) return;
      const roleDeck = deck[role];

      const selectedCard = roleDeck.find((card) => card.id === cardId);
      const prevDeck = deck;
      const newDeck = {
        ...prevDeck,
        [role]: prevDeck[role].map((card) =>
          card.id === cardId ? { ...card, selected: !selectedCard?.selected } : card,
        ),
      };

      setDeck(newDeck);
    };

    const onBlurCard = (cardId: string) => {
      if (!deck || !role) return;

      const prevDeck = deck;
      const newDeck = {
        ...prevDeck,
        [role]: prevDeck[role].map((card) => (card.id === cardId ? { ...card, selected: false } : card)),
      };

      setDeck(newDeck);
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
        {deckDetails.map((card, index) => (
          <motion.button
            key={index}
            type='button'
            whileHover={{ scale: 1.2, y: -132, width: '264px' }}
            whileFocus={{ scale: 1.2, y: -132, width: '264px' }}
            variants={cardAnimation}
            initial='initial'
            animate={card.selected ? 'animate' : 'initial'}
            onClick={() => onClickCard(card.id)}
            onBlur={() => onBlurCard(card.id)}
            className='flex shrink-0 cursor-grab justify-center focus-visible:outline-none active:cursor-grabbing'
          >
            <GameCard card={card} />
          </motion.button>
        ))}
      </div>
    );
  },
);
