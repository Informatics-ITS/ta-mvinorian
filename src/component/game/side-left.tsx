import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { getGameCardById } from '@/lib/game-card';
import { getGameNodeById, getGameTopologyNodeById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { useGameStateContext } from '@/provider/game-state-provider';

import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideLeftProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSideLeft = React.forwardRef<HTMLDivElement, GameSideLeftProps>(({ className, ...props }, ref) => {
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
      <p className='border-b border-gray-400 px-4 pb-4 text-gray-900'>What am I Clicking?</p>
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
                    className='text-center font-normal text-gray-900'
                  >
                    Select card or node to see
                    <br />
                    the description.
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
                  <p className='text-heading-18 text-gray-1000'>What is {selectedGameCard.name}?</p>
                  <p className='text-copy-14 text-gray-800'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                    mauris.
                  </p>
                </motion.div>
              )}

              {selectedGameNode && (
                <motion.div
                  key={selectedGameNode.id}
                  initial={{ opacity: 0, x: -128 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 128 }}
                  transition={{ type: 'keyframes', ease: 'easeInOut' }}
                  className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                >
                  <p className='text-heading-18 text-gray-1000'>What is {selectedGameNode.name}?</p>
                  <p className='text-copy-14 text-gray-800'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                    mauris.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DragScrollArea>
      </div>
    </div>
  );
});
