import { LockKeyholeIcon } from 'lucide-react';

import { getGameDefenseById } from '@/lib/game-defense';
import { TopologyDefenseType } from '@/lib/topology';
import { cn } from '@/lib/utils';

export interface GameDefenseProps {
  defense: TopologyDefenseType;
}

export const GameDefense = ({ defense }: GameDefenseProps) => {
  const defenseDetail = getGameDefenseById(defense.id);
  if (!defenseDetail) return null;
  const DefenseIcon = defenseDetail.icon;
  return (
    <div className='shadow-card flex aspect-square w-full flex-col items-center overflow-clip rounded-sm'>
      <div className={cn('flex w-full flex-1 items-center justify-center', defenseDetail.color.primary)}>
        <DefenseIcon className={cn(defenseDetail.color.accent)} />
      </div>
      <p
        className={cn(
          'flex h-5 w-full items-center justify-center text-center text-[8px] leading-none tracking-tight',
          defenseDetail.color.secondary,
          defenseDetail.color.strong,
        )}
      >
        {defenseDetail.name}
      </p>
    </div>
  );
};

export const GameDefenseLocked = () => {
  return (
    <div className='shadow-card flex aspect-square w-full flex-col items-center overflow-clip rounded-sm opacity-50'>
      <div className='flex w-full flex-1 items-center justify-center bg-gray-700'>
        <LockKeyholeIcon className='text-gray-100' />
      </div>
      <p className='text-gray-1000 flex h-5 w-full items-center justify-center bg-gray-600 text-center text-[8px] leading-none tracking-tight'>
        Locked
      </p>
    </div>
  );
};

export interface GameDefenseEmptyProps {
  className?: string;
}

export const GameDefenseEmpty = ({ className }: GameDefenseEmptyProps) => {
  return <div className={cn('aspect-square w-full rounded-sm border-2 border-dashed', className)}></div>;
};
