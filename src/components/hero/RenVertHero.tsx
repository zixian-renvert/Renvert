import { Button } from '@/components/ui/button';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import { Home } from 'lucide-react';
import type React from 'react';

interface RenVertHeroProps {
  title: string;
  description: string;
  logo?: Sanity.Image | any;
  ctas: Sanity.CTA[];
}

const RenVertHero: React.FC<RenVertHeroProps> = ({ title, description, logo, ctas }) => {
  // Handle different logo formats
  const getLogoImage = () => {
    if (!logo) return null;

    // If logo is already a Sanity image object
    if (logo._type === 'image' || logo.asset) {
      return logo;
    }

    // If logo is wrapped in an img object
    if (logo.image) {
      return logo.image;
    }

    // If logo has a default property (common in Sanity)
    if (logo.default) {
      return logo.default;
    }

    return logo;
  };

  const logoImage = getLogoImage();

  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-white via-slate-50 to-accent/50">
      <div className="mx-auto max-w-screen-xl px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl leading-tight">
              {title}
            </h1>
            <p className="text-xl text-secondary/70 leading-relaxed">{description}</p>
            {ctas && ctas.length > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <CTAList ctas={ctas} className="flex flex-col gap-4 sm:flex-row hero-cta-buttons" />
              </div>
            )}
          </div>
          <div className="relative h-80 md:h-96 lg:h-[500px]">
            {logoImage ? (
              <Img
                image={logoImage}
                alt="Hero Image"
                className="w-full h-full rounded-2xl object-cover shadow-2xl"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Home className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground font-medium">Hero Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RenVertHero;
