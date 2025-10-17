import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Img } from '@/ui/Img';
import { ArrowRight } from 'lucide-react';
import type React from 'react';

import CTAList from '@/ui/CTAList';
import Pretitle from '@/ui/Pretitle';
import { stegaClean } from 'next-sanity';

interface HeroProps {
  title: string;
  description?: string;
  pretitle?: string;
  highlightedTitle?: string;
  image?: {
    image: any;
    alt?: string;
  };
  ctas?: any[];
  className?: string;
  isTabbedModule?: boolean;
}

export default function Hero(props: HeroProps) {
  const { className, isTabbedModule = false } = props;

  return (
    <section
      className={cn('relative overflow-hidden', !isTabbedModule && 'py-24 sm:py-32', className)}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-3xl opacity-70 dark:from-rose-500/10 dark:to-purple-500/10" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl opacity-70 dark:from-blue-500/10 dark:to-cyan-500/10" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-4">
            <div className="lg:max-w-lg mb-10">
              {props.pretitle && <Pretitle className="mb-6">{props.pretitle}</Pretitle>}
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {props.highlightedTitle ? (
                  <>
                    <span className="inline-block mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent dark:text-rose-400 font-extrabold">
                      {props.highlightedTitle}
                    </span>{' '}
                    <br />
                  </>
                ) : null}
                <span>{props.title}</span>
              </h1>

              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                {props.description}
              </p>

              {/* Call-to-actions section */}
              {props.ctas && props.ctas.length > 0 && (
                <div className="mt-8 flex gap-4">
                  <CTAList className="max-sm:min-w-full" ctas={props.ctas} />
                </div>
              )}
            </div>
          </div>

          {props.image && (
            <div className="flex items-center justify-center lg:justify-end lg:pt-4">
              <div className="relative w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-border">
                <Img
                  image={props.image.image}
                  className="w-full object-cover"
                  alt={props.image.alt || props.image.image?.alt || 'Hero image'}
                />

                {/* Subtle decoration on the left only */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-rose-600/30 blur-xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
