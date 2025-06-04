'use client';

import { PopoverContentProps, StepType, TourProvider, useTour } from '@reactour/tour';
import { ChevronLeftIcon, ChevronRightIcon, CircleHelpIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/component/ui/button';

type UserTourContextType = {
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
};

const UserTourContext = React.createContext<UserTourContextType>({
  isReady: false,
  setIsReady: () => {},
});

export const useUserTourContext = () => {
  const context = React.useContext(UserTourContext);
  if (!context) {
    throw new Error('useUserTourContext must be used within a <UserTourProvider>');
  }
  return context;
};

export interface UserTourProviderProps {
  children: React.ReactNode;
}

export const UserTourProvider = ({ children }: UserTourProviderProps) => {
  const [isReady, setIsReady] = React.useState(false);
  const value: UserTourContextType = { isReady, setIsReady };

  const steps: StepType[] = [
    {
      selector: '[data-tour="game-role"]',
      content: 'This is your role in the game. It can be either Attacker or Defender.',
    },
    {
      selector: '[data-tour="game-instruction"]',
      content: 'This is the instruction in each phase of the game. You can always check it if you got lost.',
    },
    {
      selector: '[data-tour="game-round"]',
      content: 'This is the current game round and total game round.',
    },
    {
      selector: '[data-tour="game-tokens"]',
      content: 'This is the number of data tokens that already stolen.',
    },
    {
      selector: '[data-tour="game-card-container"]',
      mutationObservables: ['[data-tour="game-card-container"]', '[data-tour="game-card"]'],
      content: 'Now try to interact with the card.',
    },
  ];

  return (
    <UserTourContext.Provider value={value}>
      <TourProvider
        steps={steps}
        showDots={false}
        showCloseButton={false}
        styles={{
          popover: (base) => ({
            ...base,
            borderRadius: '4px',
          }),
        }}
        badgeContent={({ currentStep, totalSteps }) => currentStep + 1 + '/' + totalSteps}
        prevButton={({ currentStep, setCurrentStep }) =>
          currentStep > 0 ? (
            <Button size='sm' variant='outline' onClick={() => setCurrentStep((prev) => prev - 1)} className='!px-2.5'>
              <ChevronLeftIcon />
              Back
            </Button>
          ) : null
        }
        nextButton={({ currentStep, stepsLength, setCurrentStep }) =>
          currentStep < stepsLength - 1 ? (
            <Button
              size='sm'
              variant='outline'
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className='ml-auto !px-2.5'
            >
              Next
              <ChevronRightIcon />
            </Button>
          ) : null
        }
      >
        {children}
      </TourProvider>
    </UserTourContext.Provider>
  );
};

export const UserTourTrigger = () => {
  const { setIsOpen } = useTour();

  return (
    <Button
      size='icon'
      variant='secondary'
      className='focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex aspect-square !size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-gray-100 p-0 text-gray-900 shadow-none transition-[color,box-shadow] outline-none hover:bg-gray-100 focus-visible:ring-[3px]'
      onClick={() => setIsOpen(true)}
    >
      <CircleHelpIcon />
    </Button>
  );
};

export const UserTourContent = (props: PopoverContentProps) => {
  const content = props.steps[props.currentStep]?.content;

  return <div>{typeof content === 'function' ? null : content}</div>;
};
