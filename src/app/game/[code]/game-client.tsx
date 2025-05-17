'use client';

import React from 'react';

import { withAuth } from '@/component/hoc/with-auth';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { useGameEngineContext } from '@/provider/game-engine-provider';

export interface GameClientProps {
  code: string;
}

export const GameClient = withAuth(({}: GameClientProps) => {
  const { phase, setPhase } = useGameEngineContext();
  const [text, setText] = React.useState<string>('');

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
