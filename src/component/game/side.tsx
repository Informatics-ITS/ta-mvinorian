import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { GameCardType, getGameCardById } from '@/lib/game-card';
import { getTopologyNodeById, TopologyNodeDetailType, TopologyNodeType } from '@/lib/topology';
import { cn } from '@/lib/utils';
import { GameConstant, GameRoundPhase, useGameEngineContext } from '@/provider/game-engine-provider';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { GameCard } from './card';
import { ActiveDataToken, GameNode } from './node';

export interface GameSideProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameSide = React.forwardRef<HTMLDivElement, GameSideProps>(({ className, ...props }, ref) => {
  const sideRef = React.useRef<HTMLDivElement>(null);
  const { height } = useElementDimensions(sideRef);

  const { round, role, deck, topology, stolenTokens, roundPhase, history, clickNextRound } = useGameEngineContext();
  const [selectedCard, setSelectedCard] = React.useState<GameCardType | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<TopologyNodeType | null>(null);
  const [selectedNodeDetail, setSelectedNodeDetail] = React.useState<TopologyNodeDetailType | null>(null);

  const roleRoundPhase = roundPhase[role!];

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
    else {
      setSelectedNode(selected);
      setSelectedNodeDetail(getTopologyNodeById(selected.id) ?? null);
    }
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
      <div className='mx-4 flex gap-4'>
        <p className='text-heading-18 flex flex-1 animate-pulse justify-center gap-1.5 rounded-xs border-2 border-green-400 bg-green-100 p-2 font-medium text-green-900'>
          <AnimatePresence>
            {roleRoundPhase === GameRoundPhase.CardSelect && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Choose card to use
              </motion.span>
            )}
            {roleRoundPhase === GameRoundPhase.NodeSelect && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Choose target node to continue
              </motion.span>
            )}
            {roleRoundPhase === GameRoundPhase.ActionEnd && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Waiting for other player to finish
              </motion.span>
            )}
            {roleRoundPhase === GameRoundPhase.RoundResult && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Showing result
              </motion.span>
            )}
            {roleRoundPhase === GameRoundPhase.RoundEnd && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Waiting for other player to end round
              </motion.span>
            )}
          </AnimatePresence>
        </p>

        <AnimatePresence>
          {roleRoundPhase === GameRoundPhase.RoundResult && (
            <motion.button
              onClick={() => clickNextRound()}
              className='text-heading-18 bg-background-100 hover:bg-background-200 line-clamp-1 flex items-center justify-center border-2 border-gray-400 px-4 font-medium text-gray-900'
            >
              Next round
            </motion.button>
          )}
        </AnimatePresence>
      </div>

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
                    {selectedNode && selectedNodeDetail && role ? (
                      <motion.div
                        key={selectedNode.id}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                      >
                        <GameNode
                          node={selectedNode}
                          nodeDetail={selectedNodeDetail}
                          role={role}
                          className='scale-110'
                        />
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
                {selectedNodeDetail && (
                  <div className='bg-background-200 w-full space-y-2 rounded-xs border border-gray-400 p-4'>
                    <p className='text-heading-18 text-gray-1000'>What is {selectedNodeDetail.name}?</p>
                    <p className='text-copy-14 text-gray-800'>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum
                      mauris.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {Object.keys(history).map((key, index) => {
              if (!role) return null;

              const roleUsedCard = history[key].usedCard[role] ?? undefined;
              const usedCard = getGameCardById(roleUsedCard);

              const usedNode = history[key].usedNode?.[role] ?? undefined;
              const usedNodeDetail = getTopologyNodeById(usedNode?.id) ?? undefined;

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
                      {usedNode && usedNodeDetail && (
                        <div className='bg-background-200 flex h-96 w-full flex-col items-center justify-center gap-4 rounded-xs border border-gray-400 px-4'>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='text-copy-16 -translate-y-3 text-gray-900'
                          >
                            Target Node
                          </motion.p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75 }}
                          >
                            <GameNode node={usedNode} nodeDetail={usedNodeDetail} role={role} className='scale-110' />
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  );
});
