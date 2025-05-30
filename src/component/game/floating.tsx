import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { cn } from '@/lib/utils';
import { GameConstant, GamePlayerPhase, useGameStateContext } from '@/provider/game-state-provider';

import { Button } from '../ui/button';
import { ActiveDataToken } from './node';

export const GameFloating = () => {
  const { playerPhase, role, round, clickNextRound, getGameStolenTokens } = useGameStateContext();
  const stolenTokens = getGameStolenTokens();

  return (
    <React.Fragment>
      <AnimatePresence>
        {playerPhase === GamePlayerPhase.WaitResult && (
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 6 }}
            exit={{ opacity: 0, y: -48 }}
            className='absolute top-28 left-1/2 z-10 -translate-x-1/2 select-none'
          >
            <Button size='sm' variant='outline' className='w-48' onClick={clickNextRound}>
              Go to next round
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='bg-background-200 absolute top-16 left-1/2 z-10 flex -translate-x-1/2 gap-4 select-none'>
        <p
          className={cn(
            'text-heading-18 flex w-32 justify-center gap-2 rounded-xs border-2 p-2 font-medium',
            role === 'attacker' && 'border-red-400 bg-red-100 text-red-900',
            role === 'defender' && 'border-blue-400 bg-blue-100 text-blue-900',
          )}
        >
          {role && role[0].toUpperCase() + role.slice(1)}
        </p>

        <p className='text-heading-18 flex w-72 flex-1 justify-center gap-1.5 rounded-xs border-2 border-green-400 bg-green-100 p-2 font-medium text-green-900'>
          <AnimatePresence>
            {playerPhase === GamePlayerPhase.SelectCard && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Choose card to use
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.SelectNode && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Choose target node to continue
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.WaitTurn && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Waiting for other player to finish
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.WaitResult && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Showing result
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.EndRound && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Waiting for other player to end round
              </motion.span>
            )}
          </AnimatePresence>
        </p>

        <p className='text-heading-18 flex w-32 justify-center gap-1.5 rounded-xs border-2 p-2 font-medium'>
          Round <span>{round}</span>/<span>{GameConstant.MaxRounds}</span>
        </p>
      </div>

      <div className='absolute top-16 right-4 z-10 w-48 select-none'>
        <div className='text-heading-18 flex justify-center gap-1.5 rounded-xs border-2 border-amber-400 bg-amber-100 p-2 font-medium text-amber-900'>
          <span className='text-heading-24 leading-none'>{stolenTokens}</span>
          <span className='mr-2 pt-0.5'>
            <ActiveDataToken />
          </span>
          <span>Stolen</span>
        </div>
      </div>
    </React.Fragment>
  );
};
