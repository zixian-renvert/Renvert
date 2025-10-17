import { cn } from '@/lib/utils';
import CTA from './CTA';

type CTAItem = Sanity.CTA | { _key?: string; link?: Sanity.Link; style?: string };

export default function CTAListCallout({
  ctas,
  className,
}: {
  ctas?: CTAItem[];
} & React.ComponentProps<'div'>) {
  if (!ctas?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {ctas?.map((cta) => {
        // For items with a link, pass the link label as children if not already specified
        if ('link' in cta && cta.link && !('children' in cta)) {
          return (
            <CTA
              className={cn(
                'max-sm:w-full',
                cta.style === 'default' &&
                  'bg-[#CF3D45] hover:bg-[#b83740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-6 text-base font-medium',
                cta.style === 'secondary' &&
                  'rounded-md border border-white/20 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/10'
              )}
              size={'lg'}
              {...cta}
              key={cta._key || cta.link.label}
            >
              {cta.link.label}
            </CTA>
          );
        }
        return (
          <CTA
            className={cn(
              cta.style === 'default'
                ? 'bg-[#CF3D45] hover:bg-[#b83740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-6 text-base font-medium'
                : cta.style === 'secondary'
                  ? 'rounded-md border border-white/20 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/10'
                  : 'text-sm/6 font-semibold hover:text-white text-white bg-transparent hover:bg-transparent border-none'
            )}
            size={'lg'}
            {...cta}
            key={cta._key || Math.random()}
          />
        );
      })}
    </div>
  );
}
