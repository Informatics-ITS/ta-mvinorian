import { useMutation } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { GameLayout } from '@/app/(game)/layout';
import { api } from '@/lib/api';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export interface GameWaitingJoinProps {
  code: string;
  onLeaveGame?: () => void;
}

export const GameWaitingJoin = ({ code, onLeaveGame }: GameWaitingJoinProps) => {
  const t = useTranslations('game');
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/api/game/leave', { toastify: true });
      const { code } = res.data.data;
      return code;
    },
    onSuccess: () => {
      onLeaveGame?.();
      router.replace('/lobby');
    },
  });

  return (
    <GameLayout>
      <Card className='w-full max-w-md'>
        <CardTitle>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl'>{t('waiting-for-another-player')}</CardTitle>
            <CardDescription className='font-normal'>
              {t('copy-the-game-code-below-and-ask-other-to-join-the-game')}
            </CardDescription>
          </CardHeader>
          <CardContent className='mt-6 flex flex-col gap-6'>
            <Input value={code} readOnly className='!text-heading-40 h-fit text-center tracking-wide' />
            <Button size='lg' onClick={() => mutate()} disabled={isPending} className='w-full'>
              {t('leave-game')}
              {isPending && <LoaderCircleIcon className='ml-2 animate-spin' />}
            </Button>
          </CardContent>
        </CardTitle>
      </Card>
    </GameLayout>
  );
};
