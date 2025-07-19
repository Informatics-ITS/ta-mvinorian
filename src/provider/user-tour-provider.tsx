'use client';

import { PopoverContentProps, StepType, TourProvider, useTour } from '@reactour/tour';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  CrossIcon,
  EyeOffIcon,
  MousePointerClickIcon,
  PlayIcon,
  ScanEyeIcon,
  ShieldIcon,
  SwordIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { SecurityHighIcon, SecurityLowIcon, SecurityMediumIcon } from '@/component/game/node';
import { Button } from '@/component/ui/button';
import { Image } from '@/component/ui/image';

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
  const t = useTranslations('game');

  const [isReady, setIsReady] = React.useState(false);
  const value: UserTourContextType = { isReady, setIsReady };

  const steps: StepType[] = [
    {
      selector: 'body',
      position: 'center',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <div className='text-gray-1000 flex items-center justify-center gap-2'>
            <p className='text-label-20 mb-0.5 font-semibold'>{t('welcome-to')}</p>
            <Image alt='icon' src='/node-clash.svg' width={28} height={28} />
            <p className='text-label-20 mb-0.5 font-semibold'>
              <span className='text-blue-900'>node-</span>
              <span className='text-red-900'>clash.</span>
            </p>
          </div>
          <div className='space-y-2'>
            <p>{t('this-is-a-cybersecurity-strategy-game-where-youll-learn-about-network-attacks-and-defenses')}</p>
            <p>{t('lets-take-a-quick-tour-to-get-you-started')}</p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-role"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('your-role-in-the-game')}</p>
          <p>
            {t.rich(
              'this-shows-your-current-role-either-less-than-strong-greater-than-attacker-less-than-strong-greater-than-or-less-than-strong-greater-than-defender-less-than-strong-greater-than',
              {
                strong: (chunk) => <strong>{chunk}</strong>,
              },
            )}
          </p>
          <div className='text-red-1000 space-y-0'>
            <strong>Attacker</strong>
            <p>{t('steal-3-data-tokens-within-10-rounds-to-win')}</p>
          </div>
          <div className='text-blue-1000 space-y-0'>
            <strong>Defender</strong>
            <p>{t('prevent-losing-3-data-tokens-to-win')}</p>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-round"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('game-progress')}</p>
          <p>
            {t.rich(
              'this-shows-the-less-than-strong-greater-than-current-round-less-than-strong-greater-than-and-less-than-strong-greater-than-total-rounds-less-than-strong-greater-than-in-the-game',
              {
                strong: (chunk) => <strong>{chunk}</strong>,
              },
            )}
          </p>
          <p className='text-amber-1000 font-medium'>{t('plan-your-strategy-accordingly-round-is-limited')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-tokens"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>Data Tokens</p>
          <p>
            {t.rich(
              'this-counter-shows-how-many-data-token-have-been-less-than-strong-greater-than-stolen-less-than-strong-greater-than-so-far',
              {
                strong: (chunk) => <strong>{chunk}</strong>,
              },
            )}
          </p>
          <p className='text-amber-1000 font-medium'>{t('keep-an-eye-on-this-it-determines-who-wins-the-game')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-instruction"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('game-instructions')}</p>
          <p>{t('this-panel-shows-phase-spesific-instruction-and-guidance')}</p>
          <p className='text-amber-1000 font-medium'>{t('always-check-here-if-youre-unsure-what-to-do-next')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-board"]',
      padding: { mask: [-128, -256, -224] },
      position: [196, 128],
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('game-topology')}</p>
          <p>{t('this-is-the-network-youll-be-attacking-or-defending')}</p>
          <p>{t('you-can-zoom-on-the-board-to-see-the-node-more-clear')}</p>
          <div className='text-red-1000 flex items-center gap-2'>
            <div className='inline-flex size-8 items-center justify-center rounded-sm bg-red-700 pb-0.5 pl-0.5'>
              <SecurityLowIcon className='text-red-100' />
            </div>
            {t('low-security-nodes')}
          </div>
          <div className='text-amber-1000 flex items-center gap-2'>
            <div className='inline-flex size-8 items-center justify-center rounded-sm bg-amber-700 pb-0.5 pl-0.5'>
              <SecurityMediumIcon className='text-amber-100' />
            </div>
            {t('medium-security-nodes')}
          </div>
          <div className='text-purple-1000 flex items-center gap-2'>
            <div className='inline-flex size-8 items-center justify-center rounded-sm bg-purple-700 pb-0.5 pl-0.5'>
              <SecurityHighIcon className='text-purple-100' />
            </div>
            {t('high-security-nodes')}
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-cards"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('your-current-hand')}</p>
          <p>
            {t.rich(
              'these-are-cards-that-you-can-play-in-this-round-you-can-only-play-less-than-strong-greater-than-one-card-less-than-strong-greater-than-in-each-round-there-are-always-be-less-than-strong-greater-than-5-cards-less-than-strong-greater-than-in-your-hand',
              {
                strong: (chunk) => <strong>{chunk}</strong>,
              },
            )}
          </p>
          <div className='flex gap-3'>
            <div className='space-y-3'>
              <div className='text-purple-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-purple-700 p-1.5'>
                  <EyeOffIcon className='text-purple-100' />
                </div>
                {t('stealth-cards')}
              </div>
              <div className='text-red-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-red-700 p-1.5'>
                  <SwordIcon className='text-red-100' />
                </div>
                {t('attack-cards')}
              </div>
              <div className='text-teal-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-teal-700 p-1.5'>
                  <MousePointerClickIcon className='text-teal-100' />
                </div>
                {t('disrupt-cards')}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='text-blue-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-blue-700 p-1.5'>
                  <ShieldIcon className='text-blue-100' />
                </div>
                {t('block-cards')}
              </div>
              <div className='text-pink-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-pink-700 p-1.5'>
                  <ScanEyeIcon className='text-pink-100' />
                </div>
                {t('detect-cards')}
              </div>
              <div className='text-green-1000 flex items-center gap-2'>
                <div className='inline-flex size-8 items-center justify-center rounded-sm bg-green-700 p-1.5'>
                  <CrossIcon className='text-green-100' />
                </div>
                {t('recover-cards')}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      selector: '[data-tour="reshuffle-cards"]',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('want-a-new-set-of-cards')}</p>
          <p>
            {t.rich(
              'you-can-less-than-strong-greater-than-reshuffle-less-than-strong-greater-than-your-cards-in-hand-less-than-strong-greater-than-once-less-than-strong-greater-than-per-game',
              {
                strong: (chunk) => <strong>{chunk}</strong>,
              },
            )}
          </p>
          <p className='text-amber-1000 font-medium'>{t('only-reshuffle-cards-if-you-really-need-it')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="game-board"]',
      padding: { mask: [-128, 0, 0] },
      position: [196, 128],
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('interactive-elements')}</p>
          <p>{t('click-on-network-nodes-or-cards-to-interact-with-them')}</p>
          <p className='text-amber-1000 font-medium'>{t('try-clicking-on-a-card-or-node-to-see-how-they-work')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="side-left"]',
      padding: { mask: [-44, 0, 0] },
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('what-did-you-click')}</p>
          <p>{t('this-is-the-explanation-of-what-element-you-click')}</p>
          <p className='text-amber-1000 font-medium'>{t('read-this-to-gain-knowledge')}</p>
        </div>
      ),
    },
    {
      selector: '[data-tour="side-right"]',
      padding: { mask: [-44, 0, 0] },
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('game-history')}</p>
          <p>{t('this-area-will-show-the-history-of-card-node-effect-you-use-during-the-game')}</p>
          <p className='text-amber-1000 font-medium'>
            {t('use-this-to-track-whats-happened-and-plan-your-next-moves')}
          </p>
        </div>
      ),
    },
    {
      selector: 'body',
      content: (
        <div className='space-y-3 font-normal text-gray-900'>
          <p className='text-heading-20 text-gray-1000 font-semibold'>{t('ready-to-play')}</p>
          <p>{t('youre-all-set-remember-these-things')}</p>
          <ul className='list-disc space-y-2 pl-5'>
            <li className='text-amber-1000 font-medium'>{t('check-instruction-panel-for-guidance')}</li>
            <li className='text-amber-1000 font-medium'>{t('watch-stolen-data-tokens')}</li>
            <li className='text-amber-1000 font-medium'>{t('think-strategically-about-your-moves')}</li>
            <li className='text-amber-1000 font-medium'>{t('have-fun-learning-cybersecurity')}</li>
          </ul>
          <p>{t('you-can-restart-this-tour-anytime-by-clicking-help-button-on-the-top-right')}</p>
        </div>
      ),
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
        nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) =>
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
          ) : (
            <Button size='sm' onClick={() => setIsOpen(false)} className='ml-auto !px-2.5'>
              Start Playing
              <PlayIcon />
            </Button>
          )
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
