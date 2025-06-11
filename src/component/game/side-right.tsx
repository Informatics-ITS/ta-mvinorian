import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { getGameCardById } from '@/lib/game-card';
import { getGameTopologyNodeById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { useGameStateContext } from '@/provider/game-state-provider';

import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideRightProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSideRight = React.forwardRef<HTMLDivElement, GameSideRightProps>(({ className, ...props }, ref) => {
  const t = useTranslations();

  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { role, history, playerHistory } = useGameStateContext();

  return (
    <div
      data-tour='side-right'
      ref={ref}
      className={cn(
        'bg-background-100 divide-y-gray-400 flex h-full max-h-full w-80 flex-col divide-y overflow-hidden border-l border-gray-400 pt-16 pb-3',
        className,
      )}
      {...props}
    >
      <p className='z-10 border-b border-gray-400 px-4 pb-4 text-gray-900'>{t('game.round-history')}</p>
      <div ref={sideRef} className='relative flex-1 -translate-y-px overflow-clip'>
        <DragScrollArea className='absolute w-full' style={{ height: `${height}px` }}>
          {playerHistory[1]?.usedCardId ? (
            history.toReversed().map((h, index) => {
              if (!role) return null;

              const usedCardId = playerHistory[h.round].usedCardId;
              const targetNodeId = playerHistory[h.round].targetNodeId;
              const messages = playerHistory[h.round].messages;
              const opponentCards = [...new Set(playerHistory[h.round].opponentCards)];

              const usedGameCard = usedCardId ? getGameCardById(usedCardId) : null;
              const usedGameTopologyNode = getGameTopologyNodeById(h.topology, targetNodeId);

              if (!usedCardId || h.round === 0) return null;

              return (
                <div key={index} className='space-y-0'>
                  <p className='border-y border-gray-400 p-4 px-4 text-gray-900'>
                    {t('game.round-nth')}
                    {h.round}
                  </p>
                  <div className='space-y-4 p-4'>
                    <AnimatePresence mode='wait'>
                      {messages && messages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -128 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 128 }}
                          className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                        >
                          <p className='text-heading-18 text-gray-1000'>{t('game.game-message')}</p>
                          {messages.map((msg, i) => {
                            const tmsg = t(msg.key as any, msg.params);

                            return (
                              <p key={i} className='text-copy-14 text-gray-800'>
                                {tmsg[0].toUpperCase() + tmsg.slice(1) + '.'}
                              </p>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode='wait'>
                      {opponentCards &&
                        opponentCards.length > 0 &&
                        (() => {
                          const card = getGameCardById(opponentCards[0]);
                          if (!card) return null;

                          if (opponentCards.length === 1)
                            return (
                              <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className='text-copy-16 text-gray-1000 -translate-y-3'
                                >
                                  {t('game.opponent-card')}
                                </motion.p>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.75 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.75 }}
                                >
                                  <GameCard card={card} className='scale-110' />
                                </motion.div>
                              </div>
                            );

                          return (
                            <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400'>
                              <Carousel
                                opts={{ dragFree: true, containScroll: 'trimSnaps' }}
                                className='w-full max-w-64'
                              >
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className='text-copy-16 text-gray-1000 -translate-y-5 text-center'
                                >
                                  {t('game.opponent-cards')}
                                </motion.p>
                                <CarouselContent>
                                  {opponentCards.map((cardId, index) => {
                                    const opponentGameCard = getGameCardById(cardId);
                                    if (!opponentGameCard) return null;

                                    return (
                                      <CarouselItem key={index} className='basis-10/12'>
                                        <GameCard card={opponentGameCard} className='scale-95' />
                                      </CarouselItem>
                                    );
                                  })}
                                </CarouselContent>
                              </Carousel>
                            </div>
                          );
                        })()}
                    </AnimatePresence>

                    <AnimatePresence mode='wait'>
                      {usedGameTopologyNode && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-heading-18 text-gray-1000 -translate-y-3'
                          >
                            {t('game.target-node')}
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75 }}
                          >
                            <GameNode node={usedGameTopologyNode} role={role} className='scale-110' />
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode='wait'>
                      {usedGameCard && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-copy-16 text-gray-1000 -translate-y-3'
                          >
                            {t('game.used-card')}
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75 }}
                          >
                            <GameCard card={usedGameCard} className='scale-110' />
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-4'>
              <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
                <p className='text-center font-normal whitespace-pre-line text-gray-900'>
                  {t('game.play-the-game-to-see-the-round-history')}
                </p>
              </div>
            </div>
          )}
        </DragScrollArea>
      </div>
    </div>
  );
});
