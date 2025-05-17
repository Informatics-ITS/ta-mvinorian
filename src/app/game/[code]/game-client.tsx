'use client';

import React from 'react';

import { GameWaitingJoin } from '@/component/game/waiting-join';
import { withAuth } from '@/component/hoc/with-auth';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { useGameEngineContext, WAITING_JOIN_PHASE } from '@/provider/game-engine-provider';
import { useWsContext } from '@/provider/ws-provider';

export interface GameClientProps {
  code: string;
}

export const GameClient = withAuth(({ code }: GameClientProps) => {
  const { closeSocket } = useWsContext();
  const { phase, setPhase } = useGameEngineContext();
  const [text, setText] = React.useState<string>('');

  if (phase === WAITING_JOIN_PHASE) return <GameWaitingJoin code={code} onLeaveGame={() => closeSocket()} />;

  return (
    <div className='space-y-4'>
      <p>{phase}</p>
      <div className='flex gap-2'>
        <Input type='text' onChange={(e) => setText(e.target.value)} />
        <Button
          onClick={() => {
            setPhase(text);
          }}
        >
          Change Phase
        </Button>
      </div>
    </div>
  );
});
