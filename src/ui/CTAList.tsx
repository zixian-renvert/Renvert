import { cn } from '@/lib/utils';
import CTA from './CTA';

type CTAItem = Sanity.CTA | { _key?: string; link?: Sanity.Link; style?: string };

export default function CTAList({
  ctas,
  className,
  onClick,
}: {
  ctas?: CTAItem[];
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
} & React.ComponentProps<'div'>) {
  if (!ctas?.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-[.5em]', className)}>
      {ctas?.map((cta) => {
        // For items with a link, pass the link label as children if not already specified
        if ('link' in cta && cta.link && !('children' in cta)) {
          return (
            <CTA {...cta} key={cta._key || cta.link.label} onClick={onClick}>
              {cta.link.label}
            </CTA>
          );
        }
        return <CTA {...cta} key={cta._key || Math.random()} onClick={onClick} />;
      })}
    </div>
  );
}
