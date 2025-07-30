import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import { GameCard } from '@/component/game/card';
import { Button } from '@/component/ui/button';
import { Image } from '@/component/ui/image';
import { LocaleSwitcher } from '@/component/ui/locale-switcher';
import { getRandomGameCards } from '@/lib/game-card';
import { getUserLocale } from '@/lib/locale';

export default async function Home() {
  const locale = await getUserLocale();
  const t = (await getTranslations({ locale })) as (key: string) => string;

  return (
    <React.Fragment>
      <nav
        id='navbar'
        className='bg-background-100 fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-gray-400 px-4 py-2'
      >
        <div className='flex items-center gap-2'>
          <Image alt='icon' src='/node-clash.svg' width={24} height={24} />
          <p className='text-label-18 mb-0.5 font-semibold'>
            <span className='text-blue-900'>node-</span>
            <span className='text-red-900'>clash.</span>
          </p>
        </div>

        <div className='flex items-center gap-2.5'>
          <LocaleSwitcher />
          <Button size='sm' className='rounded-sm' asChild>
            <Link href='/lobby'>{t('landing.play-game')}</Link>
          </Button>
        </div>
      </nav>

      <div className='relative flex h-full w-full max-w-full flex-col items-center justify-start overflow-x-clip pt-0 pb-12 md:pt-12'>
        <section id='body' className='bg-background-200 relative w-full max-w-5xl space-y-0'>
          <div
            id='header'
            className='flex h-[768px] w-full flex-col-reverse items-center justify-center gap-x-4 gap-y-16 px-4 py-12 md:flex-row md:justify-between'
          >
            <div className='absolute top-12 -left-12 h-48 w-48 rounded-full bg-blue-700 blur-[164px]'></div>
            <div className='absolute -top-18 right-1/2 h-36 w-36 rounded-full bg-purple-700 blur-[164px]'></div>
            <div className='absolute top-24 -right-12 h-48 w-48 rounded-full bg-teal-700 blur-[164px]'></div>

            <div className='w-full space-y-4 text-center md:max-w-1/2 md:pl-6 md:text-left'>
              <h1 className='text-heading-48 text-gray-1000'>{t('landing.defend-attack-outsmart')}</h1>
              <p className='text-label-16 font-normal text-gray-900'>
                {t(
                  'landing.a-strategic-educational-game-that-turns-cybersecurity-into-an-engaging-interactive-experience',
                )}
              </p>

              <div className='flex justify-center gap-4 md:justify-start'>
                <Button size='lg' className='rounded-sm' asChild>
                  <Link href='/lobby'>{t('landing.play-now')}</Link>
                </Button>
                <Button variant='outline' size='lg' className='rounded-sm' asChild>
                  <Link href='#about'>{t('landing.learn-more')}</Link>
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-4 blur-[1px] md:-mr-16'>
              <GameCard card={getRandomGameCards('attacker', 1)[0]} />
              <div className='hidden space-y-4 md:block'>
                <GameCard card={getRandomGameCards('attacker', 1)[0]} />
                <GameCard card={getRandomGameCards('defender', 1)[0]} />
              </div>
            </div>
          </div>

          <div
            id='about'
            className='relative flex flex-col items-center gap-16 px-6 py-12 md:flex-row md:items-start md:px-12'
          >
            <div className='shrink-0'>
              <Image alt='icon' src='/node-clash.svg' width={256} height={256} priority className='blur-[1px]' />
            </div>
            <div className='space-y-4 py-4'>
              <h2 className='text-heading-32 text-gray-1000 text-center tracking-normal md:text-left'>
                {t('landing.what-is')} <span className='text-blue-900'>node-</span>
                <span className='text-red-900'>clash.</span>?
              </h2>
              <p className='text-copy-16 text-gray-900'>
                <span className='text-gray-1000 font-medium'>
                  {t('landing.node-clash-is-an-action-card-digital-game')}
                </span>{' '}
                {t(
                  'landing.where-you-step-into-the-role-of-an-attacker-or-defender-in-a-virtual-network-environment-designed-for-students-educators-and-cybersecurity-enthusiasts-the-game-simplifies-complex-cyber-concepts-into-visual-easy-to-understand-gameplay',
                )}
              </p>
              <p className='text-copy-16 text-gray-900'>
                <span className='text-gray-1000 font-medium'>{t('landing.built-for-learning-through-action')}</span>,{' '}
                {t(
                  'landing.node-clash-helps-you-develop-real-world-understanding-of-cyber-threats-and-defensive-strategies-without-needing-any-prior-technical-background',
                )}
              </p>
            </div>
          </div>

          <div id='showcase' className='space-y-6 px-6 py-12 md:px-12'>
            <h2 className='text-heading-32 text-gray-1000 text-center md:text-left'>Gameplay Showcase</h2>
            <figure className='shadow-card aspect-video w-full overflow-clip rounded-sm'>
              <iframe
                src='https://www.youtube.com/embed/I0pW_E2CAKA?si=2azGecTehhqq2Sza'
                title='YouTube video player'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
                className='h-full w-full'
              ></iframe>
            </figure>
            <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
              <figure className='shadow-card w-full overflow-clip rounded-sm md:flex-1'>
                <Image alt='gameplay-1' src='/landing/showcase-2.png' width={3840} height={2160} />
              </figure>
              <figure className='shadow-card w-full overflow-clip rounded-sm md:flex-1'>
                <Image alt='gameplay-2' src='/landing/showcase-1.png' width={3840} height={2160} />
              </figure>
              <figure className='shadow-card w-full overflow-clip rounded-sm md:flex-1'>
                <Image alt='gameplay-3' src='/landing/showcase-3.png' width={3840} height={2160} />
              </figure>
            </div>
          </div>
        </section>
      </div>

      <footer className='shadow-card flex w-full flex-col items-center bg-blue-700 py-12'>
        <div className='relative w-full max-w-5xl space-y-6 px-6 text-blue-100'>
          <div className='flex flex-col gap-4 md:flex-row md:justify-between md:gap-12'>
            <p className='text-heading-32 flex-1 tracking-normal'>node-clash.</p>
            <div className='flex flex-col'>
              <p className='text-copy-20 text-blue-400'>Advisor</p>
              <Link href='mailto:baskoro@its.ac.id' className='text-copy-16 text-blue-600 underline underline-offset-2'>
                Baskoro Adi Pratomo
              </Link>
              <Link href='mailto:hadziq@its.ac.id' className='text-copy-16 text-blue-600 underline underline-offset-2'>
                Hadziq Fabroyir
              </Link>
            </div>
            <div className='flex flex-col'>
              <p className='text-copy-20 text-blue-400'>Developer</p>
              <p className='text-copy-16 text-blue-600'>
                Muhammad Ersya <span className='text-blue-500'>Vino</span>rian
              </p>
              <Link
                href='mailto:mvinorian@gmail.com'
                className='text-copy-16 text-blue-600 underline underline-offset-2'
              >
                mvinorian@gmail.com
              </Link>
              <Link
                target='_blank'
                href='https://github.com/mvinorian'
                className='text-copy-16 text-blue-600 underline underline-offset-2'
              >
                github.com/mvinorian
              </Link>
              <Link
                target='_blank'
                href='https://linkedin.com/in/mvinorian'
                className='text-copy-16 text-blue-600 underline underline-offset-2'
              >
                linkedin.com/in/mvinorian
              </Link>
            </div>
          </div>
          <div className='h-px w-full bg-gray-400'></div>
          <p className='text-label-14 text-center md:text-left'>Copyright &copy; 2025 Netics Game.</p>
        </div>
      </footer>
    </React.Fragment>
  );
}
