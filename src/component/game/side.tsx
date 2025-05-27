import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { GameCardType, getGameCardById } from '@/lib/game-card';
import { getTopologyNodeById, TopologyNodeType } from '@/lib/topology';
import { cn } from '@/lib/utils';
import { useGameEngineContext } from '@/provider/game-engine-provider';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { DragScrollArea } from '../ui/drag-scroll-area';
import { GameCard } from './card';
import { GameNode } from './node';

export interface GameSideProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSide = React.forwardRef<HTMLDivElement, GameSideProps>(({ className, ...props }, ref) => {
  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { role, deck, topology, history } = useGameEngineContext();
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
        'bg-background-100 flex h-full max-h-full w-80 flex-col gap-4 overflow-hidden border-r border-gray-400 pt-16 pb-4',
        className,
      )}
      {...props}
    >
      <div ref={sideRef} className='relative flex flex-1 overflow-clip'>
        <DragScrollArea className='absolute z-20 w-full px-4' style={{ height: `${height}px` }}>
          <Accordion type='multiple'>
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
              <AccordionTrigger>Selected Card</AccordionTrigger>
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

            <AccordionItem value='selected-node'>
              <AccordionTrigger>Selected Node</AccordionTrigger>
              <AccordionContent className='mt-4 space-y-4'>
                <div className='bg-background-200 flex h-96 w-full items-center justify-center rounded-xs border border-gray-400 px-4'>
                  <AnimatePresence mode='wait'>
                    {selectedNode && role ? (
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
                        className='font-normal text-gray-900'
                      >
                        Select node to see the description
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {(() => {
                  const selectedNodeDetail = getTopologyNodeById(selectedNode?.id);
                  if (!selectedNodeDetail) return null;
                  return (
                    <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                      <p className='text-heading-18 text-gray-1000'>What is {selectedNodeDetail.name}?</p>
                      <p className='text-copy-14 text-gray-800'>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                        mauris.
                      </p>
                    </div>
                  );
                })()}
              </AccordionContent>
            </AccordionItem>

            {Object.keys(history).map((key, index) => {
              if (!role) return null;

              const roleUsedCard = history[key].usedCard[role];
              const usedCard = getGameCardById(roleUsedCard);

              const usedNode = history[key].usedNode?.[role] ?? undefined;

              const effectMsg = history[key].effectMsg?.[role] ?? undefined;

              if (!usedCard) return null;

              return (
                <AccordionItem key={index} value={`history-${key}`}>
                  <AccordionTrigger>Round {key} Action</AccordionTrigger>
                  <AccordionContent className='mt-4 space-y-4'>
                    <AnimatePresence mode='wait'>
                      {usedCard && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-copy-16 -translate-y-3 text-gray-900'
                          >
                            Used Card
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75 }}
                          >
                            <GameCard card={usedCard} className='scale-110' />
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode='wait'>
                      {usedNode && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-heading-18 text-gray-1000 -translate-y-3'
                          >
                            Target Node
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75 }}
                          >
                            <GameNode node={usedNode} role={role} className='scale-110' />
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    {effectMsg && (
                      <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                        <p className='text-heading-18 text-gray-1000'>Game Message</p>
                        <p className='text-copy-14 text-gray-800'>{effectMsg[0].toUpperCase() + effectMsg.slice(1)}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </DragScrollArea>
      </div>
    </div>
  );
});
