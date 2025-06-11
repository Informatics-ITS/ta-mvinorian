import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getServerAuthToken } from '@/lib/cookies';
import { verifyAuthToken } from '@/lib/jwt';
import { getUserLocale } from '@/lib/locale';
import { GameStateProvider } from '@/provider/game-state-provider';
import { WsProvider } from '@/provider/ws-provider';
import { getGameByUserIdService } from '@/service/game-service';

import GameClient from './game-client';

export default async function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const locale = await getUserLocale();
  const t = (await getTranslations({ locale })) as (key: string) => string;

  const { code } = await params;
  const token = await getServerAuthToken();
  if (!token) redirect('/login');

  const user = verifyAuthToken(token);
  if (!user) redirect('/login');

  const gameRes = await getGameByUserIdService(t, user.id);
  if (!gameRes.success) redirect('/lobby');

  const game = gameRes.data!;
  if (game.code !== code) redirect('/lobby');

  const role = game.attacker === user.id ? 'attacker' : game.defender === user.id ? 'defender' : null;
  if (!role) redirect('/lobby');

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL + `?user=${user.id}&code=${code}&role=${role}`;

  return (
    <WsProvider wsUrl={wsUrl}>
      <GameStateProvider code={code}>
        <GameClient code={code} />
      </GameStateProvider>
    </WsProvider>
  );
}
