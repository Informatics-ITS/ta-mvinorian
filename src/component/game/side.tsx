import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { GameCardType, getGameCardById } from '@/lib/game-card';
import { cn } from '@/lib/utils';
import { GameConstant, useGameEngineContext } from '@/provider/game-engine-provider';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { GameCard } from './card';
import { ActiveDataToken } from './node';

export interface GameSideProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSide = React.forwardRef<HTMLDivElement, GameSideProps>(({ className, ...props }, ref) => {
  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { round, role, deck, stolenTokens, usedCard } = useGameEngineContext();
  const [selectedCard, setSelectedCard] = React.useState<GameCardType | null>(null);

  const roleUsedCard = role ? usedCard[role] : null;
  const roleUsedCardDetail = roleUsedCard ? getGameCardById(roleUsedCard) : null;

  React.useEffect(() => {
    if (!role) return;
    const selected = deck[role].find((card) => card.selected);

    if (!selected) setSelectedCard(null);
    else setSelectedCard(getGameCardById(selected.id) ?? null);
  }, [deck, role]);

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background-100 flex h-full w-80 flex-col gap-4 overflow-hidden border-r border-gray-400 pt-16 pb-4',
        className,
      )}
      {...props}
    >
      <div className='space-y-4 px-4'>
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

        <div className='text-heading-18 flex justify-center gap-1.5 rounded-xs border-2 border-amber-400 bg-amber-100 p-2 font-medium text-amber-900'>
          <span className='text-heading-24 leading-none'>{stolenTokens}</span>
          <span className='mr-2 pt-0.5'>
            <ActiveDataToken />
          </span>
          <span>Stolen</span>
        </div>
      </div>

      <div ref={sideRef} className='relative flex flex-1 overflow-clip'>
        <ScrollArea className='absolute z-20 w-full px-4' style={{ height: `${height}px` }}>
          <Accordion type='multiple' defaultValue={['tutorial', 'selected-card', 'selected-node']}>
            <AccordionItem value='tutorial'>
              <AccordionTrigger>How to Play?</AccordionTrigger>
              <AccordionContent className='mt-4 space-y-4'>
                <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                  <p className='text-heading-18 text-gray-1000'>Attacker</p>
                  <p className='text-copy-14 text-gray-800'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                    mauris.
                  </p>
                </div>
                <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                  <p className='text-heading-18 text-gray-1000'>Defender</p>
                  <p className='text-copy-14 text-gray-800'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                    mauris.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='selected-card'>
              <AccordionTrigger>{roleUsedCard ? 'Used Card' : 'Selected Card'}</AccordionTrigger>
              <AccordionContent className='mt-4 space-y-4'>
                <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
                  <AnimatePresence mode='wait'>
                    {roleUsedCardDetail ? (
                      <motion.div
                        key={roleUsedCardDetail.id}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                      >
                        <GameCard card={roleUsedCardDetail} className='scale-110' />
                      </motion.div>
                    ) : selectedCard ? (
                      <motion.div
                        key={selectedCard.id}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                      >
                        <GameCard card={selectedCard} className='scale-110' />
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='font-normal text-gray-900'
                      >
                        Select card to see the description
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {(roleUsedCardDetail ?? selectedCard) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                    >
                      <p className='text-heading-18 text-gray-1000'>
                        What is {roleUsedCardDetail ? roleUsedCardDetail.name : selectedCard && selectedCard.name}?
                      </p>
                      <p className='text-copy-14 text-gray-800'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                        mauris.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='selected-node'>
              <AccordionTrigger>Selected Node</AccordionTrigger>
              <AccordionContent className='mt-4 space-y-4'>
                <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
                  <AnimatePresence mode='wait'>
                    {selectedCard ? (
                      <motion.div
                        key={selectedCard.id}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                      >
                        <GameCard card={selectedCard} className='scale-110' />
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='font-normal text-gray-900'
                      >
                        Select card to see the description
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {selectedCard && (
                  <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                    <p className='text-heading-18 text-gray-1000'>What is {selectedCard.name}?</p>
                    <p className='text-copy-14 text-gray-800'>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                      mauris.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* <p className='text-label-18 border-y border-gray-400 px-2 py-4 text-gray-900'>Selected Card</p>
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

          <p className='text-label-18 mt-4 border-y border-gray-400 px-2 py-4 text-gray-900'>Selected Node</p>
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
          </div> */}
        </ScrollArea>
      </div>
    </div>
  );
});
