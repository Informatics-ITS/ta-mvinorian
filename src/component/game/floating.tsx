import { ArrowRightIcon, ReplaceAllIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { cn } from '@/lib/utils';
import { GameConstant, GamePlayerPhase, useGameStateContext } from '@/provider/game-state-provider';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ActiveDataToken } from './node';

export const GameFloating = () => {
  const t = useTranslations('game');

  const {
    playerPhase,
    role,
    round,
    clickNextRound,
    getGameStolenTokens,
    clickReshuffleCards,
    checkCanReshuffleCards,
    getGameWinner,
  } = useGameStateContext();

  const winner = getGameWinner();
  const stolenTokens = getGameStolenTokens();
  const canReshuffleCards = checkCanReshuffleCards();

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
            <Button
              size='sm'
              variant='outline'
              className='hover:text-amber-1000 w-52 border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200'
              onClick={clickNextRound}
            >
              {t('go-to-next-round')} <ArrowRightIcon />
            </Button>
          </motion.div>
        )}

        {playerPhase === GamePlayerPhase.EndGame && (
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 6 }}
            exit={{ opacity: 0, y: -48 }}
            className='absolute top-28 left-1/2 z-10 -translate-x-1/2 select-none'
          >
            <Button
              size='sm'
              variant='outline'
              className='hover:text-amber-1000 w-52 border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200'
            >
              {t('game-ended')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='bg-background-200 absolute top-16 left-1/2 z-10 flex -translate-x-1/2 gap-4 select-none'>
        <p
          data-tour='game-role'
          className={cn(
            'text-heading-18 flex w-32 justify-center gap-2 rounded-xs border-2 p-2 font-medium',
            role === 'attacker' && 'border-red-400 bg-red-100 text-red-900',
            role === 'defender' && 'border-blue-400 bg-blue-100 text-blue-900',
          )}
        >
          {role && role[0].toUpperCase() + role.slice(1)}
        </p>

        <p
          data-tour='game-instruction'
          className='text-heading-18 flex w-[328px] flex-1 justify-center gap-1.5 rounded-xs border-2 border-green-400 bg-green-100 p-2 font-medium text-green-900'
        >
          <AnimatePresence>
            {playerPhase === GamePlayerPhase.SelectCard && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('choose-card-to-use')}
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.SelectNode && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('choose-target-node-to-continue')}
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.WaitTurn && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('waiting-for-other-player-to-finish')}
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.WaitResult && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('showing-result')}
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.EndRound && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('waiting-for-other-player-to-end-round')}
              </motion.span>
            )}
            {playerPhase === GamePlayerPhase.EndGame && winner && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {winner[0].toUpperCase() + winner.slice(1)} {t('wins-the-game')}
              </motion.span>
            )}
          </AnimatePresence>
        </p>

        <p
          data-tour='game-round'
          className='text-heading-18 flex w-32 justify-center gap-1.5 rounded-xs border-2 p-2 font-medium'
        >
          {t('round')} <span>{round}</span>/<span>{GameConstant.MaxRounds}</span>
        </p>
      </div>

      <div className='absolute top-16 right-4 z-10 w-48 select-none'>
        <div
          data-tour='game-tokens'
          className='text-heading-18 flex justify-center gap-1.5 rounded-xs border-2 border-amber-400 bg-amber-100 p-2 font-medium text-amber-900'
        >
          <span className='text-heading-24 leading-none'>{stolenTokens}</span>
          <span className='pt-0.5'>
            <ActiveDataToken />
          </span>
          <span className='ml-0.5'>{t('stolen')}</span>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className='absolute right-4 bottom-[232px] z-10 !font-normal select-none'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-tour='reshuffle-cards'
                  size='lg'
                  variant='outline'
                  disabled={playerPhase !== GamePlayerPhase.SelectCard || !canReshuffleCards}
                  className='!pointer-events-auto'
                >
                  <ReplaceAllIcon />
                  {t('reshuffle-cards')}
                </Button>
              </TooltipTrigger>
              {(playerPhase !== GamePlayerPhase.SelectCard || !canReshuffleCards) && (
                <TooltipContent align='end'>
                  {!canReshuffleCards ? (
                    <p>{t('you-can-only-reshuffle-cards-once-per-game')}</p>
                  ) : playerPhase !== GamePlayerPhase.SelectCard ? (
                    <p>{t('you-can-only-reshuffle-cards-during-the-select-card-phase')}</p>
                  ) : null}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('are-you-sure-you-want-to-reshuffle-your-cards')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'this-action-will-reshuffle-all-your-cards-in-the-deck-and-draw-a-new-hand-of-cards-you-can-only-do-this-once-per-game',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={clickReshuffleCards}>{t('reshuflle-cards')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};
