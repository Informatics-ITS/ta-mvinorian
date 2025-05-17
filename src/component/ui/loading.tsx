import { LoaderCircleIcon } from 'lucide-react';

export const Loading = () => {
  return (
    <div className='absolute top-0 left-0 z-50 flex h-svh w-full items-center justify-center overflow-hidden p-6'>
      <LoaderCircleIcon className='text-muted-foreground h-10 w-10 animate-spin' />
    </div>
  );
};
