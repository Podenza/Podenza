import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, LayoutDashboard } from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <div className={'container mx-auto'}>
        <Hero
          pill={
            <Pill label={'Nuevo'}>
              <span>La plataforma de colaboración empresarial más innovadora</span>
            </Pill>
          }
          title={
            <>
              <span>Impulsa la colaboración</span>
              <span>y el dinamismo empresarial</span>
            </>
          }
          subtitle={
            <span>
              PODENZA conecta equipos, optimiza procesos y acelera el crecimiento.
              La plataforma que transforma la manera de colaborar en tu empresa.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <Image
              priority
              className={
                'dark:border-primary/10 rounded-2xl border border-gray-200'
              }
              width={3558}
              height={2222}
              src={`/images/dashboard.webp`}
              alt={`PODENZA Dashboard`}
            />
          }
        />
      </div>

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">
                  La plataforma empresarial definitiva
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal">
                  PODENZA transforma la colaboración y dinamiza el trabajo en equipo
                  con innovación constante.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <LayoutDashboard className="h-5" />
                <span>Solución integral</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Dashboard Intuitivo'}
                description={`PODENZA ofrece un dashboard elegante y funcional para gestionar la colaboración empresarial.`}
              />

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'Equipos Conectados'}
                description={`Conecta y sincroniza equipos distribuidos con herramientas de colaboración avanzadas.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Procesos Optimizados'}
                description={`Automatiza y optimiza flujos de trabajo para maximizar la productividad.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Análisis en Tiempo Real'}
                description={`PODENZA proporciona insights y métricas para impulsar el crecimiento empresarial.`}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'link'}>
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </CtaButton>
    </div>
  );
}
