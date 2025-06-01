import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { getGameCardById } from '@/lib/game-card';
import { getGameTopologyNodeById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { useGameStateContext } from '@/provider/game-state-provider';

import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideRightProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSideRight = React.forwardRef<HTMLDivElement, GameSideRightProps>(({ className, ...props }, ref) => {
  const t = useTranslations('game');

  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { role, history, playerHistory } = useGameStateContext();

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background-100 divide-y-gray-400 flex h-full max-h-full w-80 flex-col divide-y overflow-hidden border-l border-gray-400 pt-16 pb-3',
        className,
      )}
      {...props}
    >
      <p className='z-10 border-b border-gray-400 px-4 pb-4 text-gray-900'>{t('round-history')}</p>
      <div ref={sideRef} className='relative flex-1 -translate-y-px overflow-clip'>
        <DragScrollArea className='absolute w-full' style={{ height: `${height}px` }}>
          {playerHistory[1]?.usedCardId ? (
            history.toReversed().map((h, index) => {
              if (!role) return null;

              const usedCardId = playerHistory[h.round].usedCardId;
              const targetNodeId = playerHistory[h.round].targetNodeId;
              const messages = playerHistory[h.round].messages;

              const usedGameCard = usedCardId ? getGameCardById(usedCardId) : null;
              const usedGameTopologyNode = getGameTopologyNodeById(h.topology, targetNodeId);

              if (!usedCardId || h.round === 0) return null;

              return (
                <div key={index} className='space-y-0'>
                  <p className='border-y border-gray-400 p-4 px-4 text-gray-900'>
                    {t('round-nth')}
                    {h.round}
                  </p>
                  <div className='space-y-4 p-4'>
                    {messages && messages.length > 0 && (
                      <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                        <p className='text-heading-18 text-gray-1000'>{t('game-message')}</p>
                        {messages.map((msg, i) => (
                          <p key={i} className='text-copy-14 text-gray-800'>
                            {msg[0].toUpperCase() + msg.slice(1) + '.'}
                          </p>
                        ))}
                      </div>
                    )}

                    <AnimatePresence mode='wait'>
                      {usedGameTopologyNode && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-heading-18 text-gray-1000 -translate-y-3'
                          >
                            {t('target-node')}
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
                            {t('used-card')}
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
                  {t('play-the-game-to-see-the-round-history')}
                </p>
              </div>
            </div>
          )}
        </DragScrollArea>
      </div>
    </div>
  );
});
