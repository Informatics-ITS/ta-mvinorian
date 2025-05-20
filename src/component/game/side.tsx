import React from 'react';

import { GameCardType, getGameCardById } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { GameConstant, useGameEngineContext } from '@/provider/game-engine-provider';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { GameCard } from './card';
import { ActiveDataToken } from './node';

export interface GameSideProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSide = React.forwardRef<HTMLDivElement, GameSideProps>(({ className, ...props }, ref) => {
  const { round, role, deck, stolenTokens } = useGameEngineContext();
  const [selectedCard, setSelectedCard] = React.useState<GameCardType | null>(null);

  React.useEffect(() => {
    if (!deck || !role) return;
    const selected = deck[role].find((card) => card.selected);

    if (!selected) setSelectedCard(null);
    else setSelectedCard(getGameCardById(selected.id) ?? null);
  }, [deck, role]);

  return (
    <div
      ref={ref}
      className={cn('bg-background-100 h-full w-80 space-y-4 border-r border-gray-400 px-4 pt-16', className)}
      {...props}
    >
      <div className='flex gap-4'>
        <p
          className={cn(
            'text-heading-18 flex flex-1 justify-center gap-2 rounded-xs border-2 p-2 font-medium',
            role === 'attacker' && 'border-red-400 bg-red-100 text-red-900',
            role === 'defender' && 'border-blue-400 bg-blue-100 text-blue-900',
          )}
        >
          {role && role[0].toUpperCase() + role.slice(1)}
        </p>
        <p className='text-heading-18 flex flex-1 justify-center gap-1.5 rounded-xs border-2 p-2 font-medium'>
          Round <span>{round}</span>/<span>{GameConstant.MaxRounds}</span>
        </p>
      </div>

      <div className='text-heading-18 flex flex-1 justify-center gap-1.5 rounded-xs border-2 border-amber-400 bg-amber-100 p-2 font-medium text-amber-900'>
        <span className='text-heading-24 leading-none'>{stolenTokens}</span>
        <span className='mr-2 pt-0.5'>
          <ActiveDataToken />
        </span>
        <span>Stolen</span>
      </div>

      <Accordion type='multiple' defaultValue={['selected-card']} className='w-full'>
        <AccordionItem value='selected-card'>
          <AccordionTrigger>Selected Card</AccordionTrigger>
          <AccordionContent>
            <div className='mt-4 space-y-4'>
              {selectedCard ? (
                <React.Fragment>
                  <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
                    <GameCard card={selectedCard} className='scale-110' />
                  </div>
                  <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                    <p className='text-heading-18 text-gray-1000'>What is {selectedCard.name}?</p>
                    <p className='text-copy-14 text-gray-800'>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                      mauris.
                    </p>
                  </div>
                </React.Fragment>
              ) : (
                <p className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4 font-normal text-gray-900'>
                  Select card to see the description
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});
