import { ViewIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { getGameCardById } from '@/lib/game-card';
import { getGameDefenseById } from '@/lib/game-defense';
import { getGameNodeById, getGameTopologyNodeById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { useGameStateContext } from '@/provider/game-state-provider';

import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideLeftProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSideLeft = React.forwardRef<HTMLDivElement, GameSideLeftProps>(({ className, ...props }, ref) => {
  const t = useTranslations();

  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { role, getGameTopology, getGamePlayerCards, getGamePlayerNodes } = useGameStateContext();

  const topology = getGameTopology();
  const selectedCard = getGamePlayerCards().filter((card) => card.selected)[0] ?? null;
  const selectedNode = getGamePlayerNodes().filter((node) => node.selected)[0] ?? null;

  const selectedGameCard = selectedCard ? getGameCardById(selectedCard.id) : null;
  const selectedGameNode = selectedNode ? getGameNodeById(selectedNode.id) : null;
  const selectedGameTopologyNode = selectedNode ? getGameTopologyNodeById(topology, selectedNode.id) : null;

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background-100 divide-y-gray-400 flex h-full max-h-full w-80 flex-col gap-4 divide-y overflow-hidden border-r border-gray-400 pt-16 pb-4',
        className,
      )}
      {...props}
    >
      <p className='border-b border-gray-400 px-4 pb-4 text-gray-900'>{t('game.what-am-i-clicking')}</p>
      <div ref={sideRef} className='relative flex-1 overflow-clip'>
        <DragScrollArea className='absolute w-full px-4' style={{ height: `${height}px` }}>
          <div className='space-y-4'>
            <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
              <AnimatePresence mode='wait'>
                {selectedGameCard ? (
                  <motion.div
                    key={selectedGameCard.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                  >
                    <GameCard card={selectedGameCard} className='scale-110' />
                  </motion.div>
                ) : selectedGameTopologyNode && role ? (
                  <motion.div
                    key={selectedGameTopologyNode.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                  >
                    <GameNode node={selectedGameTopologyNode} role={role} className='scale-110' />
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-center font-normal whitespace-pre-line text-gray-900'
                  >
                    {t('game.select-card-or-node-to-see-the-description')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode='wait'>
              {selectedGameCard && (
                <motion.div
                  key={selectedGameCard.id}
                  initial={{ opacity: 0, x: -128 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 128 }}
                  transition={{ type: 'keyframes', ease: 'easeInOut' }}
                  className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                >
                  <p className='text-heading-18 text-gray-1000'>
                    {t('game.what-is')} {selectedGameCard.name}?
                  </p>
                  <p className='text-copy-14 text-gray-800'>{t(selectedGameCard.education as any)}</p>
                </motion.div>
              )}

              {selectedGameNode && (
                <React.Fragment>
                  {role === 'defender' &&
                    (selectedGameTopologyNode?.revealed ||
                      selectedGameTopologyNode?.defenses.some((item) => item.revealed)) && (
                      <motion.div
                        key={selectedGameNode.id + '-warning'}
                        initial={{ opacity: 0, x: -128 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 128 }}
                        transition={{ type: 'keyframes', ease: 'easeInOut' }}
                        className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                      >
                        <p className='text-heading-18 text-gray-1000'>{t('game.beware')}</p>
                        <div className='text-copy-14 text-gray-800'>
                          {t('game.attacker-can-see-items-that-are-marked-with')}{' '}
                          <ViewIcon className='inline-block text-red-800' /> {t('game.or')}{' '}
                          <div className='inline-block size-3 rounded-full bg-red-800'></div>.
                        </div>
                      </motion.div>
                    )}
                  <motion.div
                    key={selectedGameNode.id}
                    initial={{ opacity: 0, x: -128 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 128 }}
                    transition={{ type: 'keyframes', ease: 'easeInOut', delay: 0.2 }}
                    className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                  >
                    <p className='text-heading-18 text-gray-1000'>
                      {t('game.what-is')} {selectedGameNode.name}?
                    </p>
                    <p className='text-copy-14 text-gray-800'>{t(selectedGameNode.education as any)}</p>
                  </motion.div>
                  {selectedGameTopologyNode?.defenses.map((defense, index) => {
                    if (role === 'attacker' && !defense.revealed) return null;

                    const gameDefense = getGameDefenseById(defense.id);
                    if (!gameDefense) return null;

                    const GameDefenseIcon = gameDefense.icon;

                    return (
                      <motion.div
                        key={gameDefense.id + selectedGameTopologyNode.id + index}
                        initial={{ opacity: 0, x: -128 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 128 }}
                        transition={{ type: 'keyframes', ease: 'easeInOut', delay: (index + 2) * 0.2 }}
                        className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                      >
                        <p className='text-heading-18 flex items-center gap-2'>
                          <GameDefenseIcon /> {gameDefense.alias}
                        </p>
                        <p className='text-copy-14 mt-2 text-gray-900'>{t(gameDefense.desc as any)}</p>
                        <p className='text-copy-14 text-gray-800'>{t(gameDefense.education as any)}</p>
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              )}
            </AnimatePresence>
          </div>
        </DragScrollArea>
      </div>
    </div>
  );
});
