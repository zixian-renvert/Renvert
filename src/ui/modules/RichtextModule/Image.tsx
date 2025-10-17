import { Img } from '@/ui/Img';
import { stegaClean } from 'next-sanity';

export default function Image({
  value,
}: {
  value: Sanity.Image & {
    caption?: string;
    source?: string;
    float?: 'left' | 'right';
  };
}) {
  return (
    <figure
      className="max-lg:full-bleed space-y-2 text-center md:[grid-column:bleed]!"
      style={{ float: stegaClean(value.float) }}
    >
      <Img
        className="bg-primary/3 mx-auto max-h-svh w-auto text-[0px]"
        image={value}
        width={1500}
      />

      {value.caption && (
        <figcaption className="text-muted-foreground px-4 text-sm text-balance italic">
          {value.caption}

          {value.source &&
            (() => {
              let isValid = false;
              try {
                const url = new URL(value.source);
                isValid = url.protocol === 'http:' || url.protocol === 'https:';
              } catch {
                isValid = false;
              }
              return isValid ? (
                <>
                  {' ('}
                  <a href={value.source} className="image-source link">
                    Source
                  </a>
                  {')'}
                </>
              ) : null;
            })()}
        </figcaption>
      )}
    </figure>
  );
}
