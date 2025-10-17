import RenVertHero from '@/components/hero/RenVertHero';
import { stegaClean } from 'next-sanity';

export default function RenVertHeroModule(
  props: any // Use any to allow all the new fields
) {
  // Handle logo prop with better fallbacks
  const getLogo = () => {
    // Try the new logo field first
    if (props.logo) {
      return props.logo;
    }

    // Fallback to old logoImage field
    if (props.logoImage) {
      // If logoImage is an img object, extract the image
      if (props.logoImage.image) {
        return props.logoImage.image;
      }
      // If logoImage is directly an image
      if (props.logoImage._type === 'image' || props.logoImage.asset) {
        return props.logoImage;
      }
      return props.logoImage;
    }

    return null;
  };

  // Handle CTAs prop
  const getCTAs = () => {
    if (props.ctas && Array.isArray(props.ctas)) {
      return props.ctas;
    }
    return [];
  };

  return (
    <RenVertHero
      title={props.title || ''}
      description={props.description || ''}
      logo={getLogo()}
      ctas={getCTAs()}
    />
  );
}
