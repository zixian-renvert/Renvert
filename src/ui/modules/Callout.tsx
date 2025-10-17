import { PortableText, stegaClean } from 'next-sanity';
import CTAListCallout from '../CTAListCallout';

export default function Callout({
  pretitle,
  heading,
  description,
  ctas,
}: Partial<{
  pretitle?: string;
  heading: string;
  description: string;
  ctas: Sanity.CTA[];
  isTabbedModule?: boolean;
}>) {
  return (
    <section className="w-full py-24 sm:py-32">
      <div className="w-full">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-24 text-center shadow-2xl sm:px-16">
          {/* Red accent shapes */}
          <div className="absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-[#CF3D45]/20 blur-3xl" />
          <div className="absolute -left-20 bottom-1/4 h-48 w-48 rounded-full bg-[#CF3D45]/15 blur-2xl" />

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern" />
          </div>

          <div className="container relative mx-auto z-10">
            <div className="mx-auto max-w-3xl text-center">
              {pretitle && (
                <div className="inline-block rounded-full bg-[#CF3D45]/10 px-4 py-1.5 text-sm font-medium text-white mb-6 border border-[#CF3D45]/20">
                  {pretitle}
                </div>
              )}
              <h2 className="mb-8 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                {heading}
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-300 md:text-xl">
                {description}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <CTAListCallout className="!mt-2" ctas={stegaClean(ctas)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
