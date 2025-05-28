import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { GameCardType, getGameCardById } from '@/lib/game-card';
import { getTopologyNodeById, TopologyNodeType } from '@/lib/topology';
import { cn } from '@/lib/utils';
import { useGameEngineContext } from '@/provider/game-engine-provider';

import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideLeftProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSideLeft = React.forwardRef<HTMLDivElement, GameSideLeftProps>(({ className, ...props }, ref) => {
  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { role, deck, topology } = useGameEngineContext();
  const [selectedCard, setSelectedCard] = React.useState<GameCardType | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<TopologyNodeType | null>(null);

  React.useEffect(() => {
    if (!role) return;
    const selected = deck[role].find((card) => card.selected);

    if (!selected) setSelectedCard(null);
    else setSelectedCard(getGameCardById(selected.id) ?? null);
  }, [deck, role]);

  React.useEffect(() => {
    if (!role || !topology) return;
    const selected = topology.nodes.find((node) => node.selected[role]);

    if (!selected) setSelectedNode(null);
    else setSelectedNode(selected);
  }, [topology, role]);

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
                {selectedCard ? (
                  <motion.div
                    key={selectedCard.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                  >
                    <GameCard card={selectedCard} className='scale-110' />
                  </motion.div>
                ) : selectedNode && role ? (
                  <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                  >
                    <GameNode node={selectedNode} role={role} className='scale-110' />
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
              {selectedCard && (
                <motion.div
                  key={selectedCard.id}
                  initial={{ opacity: 0, x: -128 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 128 }}
                  transition={{ type: 'keyframes', ease: 'easeInOut' }}
                  className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                >
                  <p className='text-heading-18 text-gray-1000'>What is {selectedCard.name}?</p>
                  <p className='text-copy-14 text-gray-800'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                    mauris.
                  </p>
                </motion.div>
              )}

              {(() => {
                const selectedNodeDetail = getTopologyNodeById(selectedNode?.id);
                if (!selectedNodeDetail) return null;
                return (
                  <motion.div
                    key={selectedNodeDetail.id}
                    initial={{ opacity: 0, x: -128 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 128 }}
                    transition={{ type: 'keyframes', ease: 'easeInOut' }}
                    className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'
                  >
                    <p className='text-heading-18 text-gray-1000'>What is {selectedNodeDetail.name}?</p>
                    <p className='text-copy-14 text-gray-800'>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                      mauris.
                    </p>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </DragScrollArea>
      </div>
    </div>
  );
});
