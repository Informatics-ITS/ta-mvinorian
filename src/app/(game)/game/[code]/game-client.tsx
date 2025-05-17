'use client';

import React from 'react';

import { GameBoard } from '@/component/game/game-board';
import { GameDeck } from '@/component/game/game-deck';
import { GameWaitingJoin } from '@/component/game/waiting-join';
import { withAuth } from '@/component/hoc/with-auth';
import { GAME_PHASE, useGameEngineContext, WAITING_JOIN_PHASE } from '@/provider/game-engine-provider';
import { useWsContext } from '@/provider/ws-provider';

export interface GameClientProps {
  code: string;
}

const GameClient = ({ code }: GameClientProps) => {
  const { closeSocket } = useWsContext();
  const { phase, role, topology, deck, setDeck } = useGameEngineContext();

  return (
    <React.Fragment>
      {phase === WAITING_JOIN_PHASE && <GameWaitingJoin code={code} onLeaveGame={() => closeSocket()} />}
      {phase === GAME_PHASE && (
        <GameBoard topology={topology} role={role}>
          <GameDeck deck={deck} setDeck={setDeck} role={role} />
        </GameBoard>
      )}
    </React.Fragment>
  );
};

export default withAuth(GameClient);
