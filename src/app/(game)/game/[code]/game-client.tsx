'use client';

import React from 'react';

import { GamePlay } from '@/component/game/play';
import { GameWaitingJoin } from '@/component/game/waiting-join';
import { withAuth } from '@/component/hoc/with-auth';
import { GamePhase, useGameEngineContext } from '@/provider/game-engine-provider';
import { useWsContext } from '@/provider/ws-provider';

export interface GameClientProps {
  code: string;
}

const GameClient = ({ code }: GameClientProps) => {
  const { closeSocket } = useWsContext();
  const { phase } = useGameEngineContext();

  return (
    <React.Fragment>
      {phase === GamePhase.WaitingJoin && <GameWaitingJoin code={code} onLeaveGame={() => closeSocket()} />}
      {phase === GamePhase.Play && <GamePlay />}
    </React.Fragment>
  );
};

export default withAuth(GameClient);
