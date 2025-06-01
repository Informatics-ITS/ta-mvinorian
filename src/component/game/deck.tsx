import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { getGameCardById } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { GamePlayerPhase, useGameStateContext } from '@/provider/game-state-provider';

import { Button } from '../ui/button';
import { GameCard } from './card';

export interface GameDeckProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameDeck = React.forwardRef<HTMLDivElement, GameDeckProps>(({ className, ...props }, ref) => {
  const t = useTranslations('game');
  const { playerPhase, getGamePlayerCards, clickCard, clickUseCard } = useGameStateContext();

  const gamePlayerCards = getGamePlayerCards();

  const cardAnimation = {
    initial: { scale: 1, y: 0 },
    animate: { scale: 1.2, y: -132, width: '264px' },
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background-100 absolute bottom-0 left-0 z-10 flex w-full translate-y-[108px] justify-center border-t border-gray-400 p-4',
        className,
      )}
      {...props}
    >
      <div className='absolute bottom-0 left-0 z-20 h-32 w-full'></div>
      <AnimatePresence initial={false} mode='popLayout'>
        {gamePlayerCards &&
          gamePlayerCards.length > 0 &&
          gamePlayerCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 300 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, y: -300, transition: { duration: 0.3 } }}
              layout
              className='mx-2 flex shrink-0 justify-center'
            >
              <motion.div
                variants={cardAnimation}
                initial='initial'
                animate={card.selected ? 'animate' : 'initial'}
                whileHover='animate'
                className='flex shrink-0 justify-center focus-visible:outline-none'
              >
                <GameCard card={getGameCardById(card.id)!} onClick={() => clickCard(card.id)} className='relative' />
                <AnimatePresence>
                  {card.selected && playerPhase === GamePlayerPhase.SelectCard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute z-20 flex h-72 w-52 shrink-0 flex-col items-center overflow-clip rounded-xl'
                    >
                      <Button
                        size='lg'
                        variant='ghost'
                        onClick={() => clickUseCard(card.id)}
                        className='!text-label-20 hover:bg-background-100 hover:border-background-100 relative z-20 mt-[72px] border border-gray-400 text-gray-100'
                      >
                        {t('use-card')}
                      </Button>
                      <div
                        className='bg-gray-1000 absolute right-0 left-0 h-full w-full opacity-40'
                        onClick={() => clickCard(card.id)}
                      ></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
});
