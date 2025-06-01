import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { withAsyncAuthUser } from '@/lib/auth';
import { getServerAuthToken } from '@/lib/cookies';
import { getUserLocale } from '@/lib/locale';
import { getGameByUserIdService } from '@/service/game-service';

export default async function Home() {
  const locale = await getUserLocale();
  const t = (await getTranslations({ locale })) as (key: string) => string;

  const token = await getServerAuthToken();
  const res = await withAsyncAuthUser(token, ({ id }) => getGameByUserIdService(t, id));
  if (res.success) redirect(`/game/${res.data!.code}`);

  redirect('/lobby');
}
