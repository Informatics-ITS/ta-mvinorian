import { redirect } from 'next/navigation';

import { getServerAuthToken } from '@/lib/cookies';
import { verifyAuthToken } from '@/lib/jwt';
import { GameEngineProvider } from '@/provider/game-engine-provider';
import { WsProvider } from '@/provider/ws-provider';
import { getGameByUserIdService } from '@/service/game-service';

import { GameClient } from './game-client';

export default async function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = await getServerAuthToken();
  if (!token) redirect('/login');

  const user = verifyAuthToken(token);
  if (!user) redirect('/login');

  const gameRes = await getGameByUserIdService(user.id);
  if (!gameRes.success) redirect('/lobby');

  const game = gameRes.data!;
  if (game.code !== code) redirect('/lobby');

  const role = game.attacker === user.id ? 'attacker' : game.defender === user.id ? 'defender' : null;
  if (!role) redirect('/lobby');

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL + `?user=${user.id}&code=${code}&role=${role}`;

  return (
    <WsProvider wsUrl={wsUrl}>
      <GameEngineProvider>
        <GameClient code={code} />
      </GameEngineProvider>
    </WsProvider>
  );
}
