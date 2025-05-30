'use client';

import React from 'react';

import { GamePlay } from '@/component/game/play';
import { GameWaitingJoin } from '@/component/game/waiting-join';
import { withAuth } from '@/component/hoc/with-auth';
import { GamePlayerPhase, useGameStateContext } from '@/provider/game-state-provider';
import { useWsContext } from '@/provider/ws-provider';

export interface GameClientProps {
  code: string;
}

const GameClient = ({ code }: GameClientProps) => {
  const { closeSocket } = useWsContext();
  const { playerPhase } = useGameStateContext();

  return (
    <React.Fragment>
      {playerPhase === GamePlayerPhase.WaitGame && <GameWaitingJoin code={code} onLeaveGame={() => closeSocket()} />}
      {playerPhase !== GamePlayerPhase.WaitGame && <GamePlay />}
    </React.Fragment>
  );
};

export default withAuth(GameClient);
