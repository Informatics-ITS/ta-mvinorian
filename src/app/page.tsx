import { redirect } from 'next/navigation';

import { withAsyncAuthUser } from '@/lib/auth';
import { getServerAuthToken } from '@/lib/cookies';
import { getGameByUserIdService } from '@/service/game-service';

export default async function Home() {
  const token = await getServerAuthToken();
  const res = await withAsyncAuthUser(token, ({ id }) => getGameByUserIdService(id));
  if (res.success) redirect(`/game/${res.data!.code}`);

  redirect('/lobby');
}
