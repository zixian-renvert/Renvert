import type { SanityAssetDocument, SanityDocument } from 'next-sanity';

declare global {
  namespace Sanity {
    // color value type for reuse

    // Stat interface for Hero stats component
    interface Stat {
      _key: string;
      value: string;
      label: string;
      icon?: Icon;
    }

    // documents

    interface Site extends SanityDocument {
      // branding
      title: string;
      tagline?: any;
      logo?: Logo;
      // info
      announcements?: Announcement[];
      copyright?: any;
      ogimage?: string;
      // navigation
      ctas?: CTA[];
      headerMenu?: Navigation;
      footerMenu?: Navigation;
      social?: Navigation;
    }

    interface Navigation extends SanityDocument {
      title: string;
      items?: (Link | LinkList)[];
    }

    // pages

    interface PageBase extends SanityDocument {
      _type: string;
      title?: string;
      parent?: Page[];
      metadata: Metadata;
      language?: string;
    }

    interface Page extends PageBase {
      readonly _type: 'page';
      modules?: Module[];
    }
    interface Translation {
      slug: string;
      translations?: {
        slug: string;
        slugBlogAlt?: string;
        language: string;
      }[];
    }

    interface GlobalModule extends SanityDocument {
      path: string;
      excludePaths?: string[];
      modules?: Module[];
    }

    interface BlogPost extends SanityDocument {
      _type: 'blog.post';
      body: any[];
      categories: SanityReference[];
      authors: SanityReference[];
      publishDate: string;
      featured?: boolean;
      hideTableOfContents?: boolean;
      metadata?: Metadata;
      relatedPosts?: SanityReference[];
    }

    interface BlogCategory extends SanityDocument {
      readonly _type: 'blog.category';
      title: string;
      description?: string;
      slug?: { current: string };
    }

    // miscellaneous

    interface Announcement extends SanityDocument {
      content: any;
      cta?: Link;
      start?: string;
      end?: string;
    }

    interface Logo extends SanityDocument {
      name: string;
      image?: Partial<{
        default: Image;
        light: Image;
        dark: Image;
      }>;
    }

    interface Person extends SanityDocument {
      name: string;
      title?: string;
      bio?: string;
      image?: Image;
      socialLinks?: {
        twitter?: string;
        linkedIn?: string;
        instagram?: string;
        youtube?: string;
      };
    }

    interface Pricing extends SanityDocument {
      title: string;
      highlight?: string;
      price: {
        base?: string;
        yearly?: string;
        currency?: string;
        suffix?: string;
      };
      ctas?: CTA[];
      content?: any;
    }

    // objects

    interface CTA {
      readonly _type?: 'cta';
      _key?: string;
      text?: string;
      linkType?: 'internal' | 'external';
      internalLink?: SanityDocument;
      externalLink?: string;
      style?: string;
      size?: 'default' | 'sm' | 'lg';
      icon?: any;
      newTab?: boolean;
      params?: string;
    }

    interface Icon {
      readonly _type: 'icon';
      ic0n?: string;
    }

    interface Img {
      readonly _type: 'img';
      image: Image;
      responsive?: {
        image: Image;
        media: string;
      }[];
      alt?: string;
      loading?: 'lazy' | 'eager';
      asset?: any;
      url?: string;
    }

    interface Image extends SanityAssetDocument {
      alt: string;
      loading: 'lazy' | 'eager';
    }

    interface Link {
      readonly _type: 'link';
      label?: string;
      description?: string;
      type?: 'internal' | 'external';
      internal?: Page | BlogPost | Changelog;
      external?: string;
      params?: string;
    }

    interface LinkList {
      readonly _type: 'link.list';
      link?: Link;
      links?: Link[];
    }

    interface Metadata {
      slug: { current: string };
      title: string;
      description: string;
      image?: Image;
      ogimage?: string;
      noIndex: boolean;
    }

    interface Module {
      _type:
        | 'blog-frontpage'
        | 'blog-list'
        | 'blog-post-content'
        | 'breadcrumbs'
        | 'callout'
        | 'customer-showcase'
        | 'contactForm'
        | 'earlyAccess'
        | 'feature-grid'
        | 'featuredHero'
        | 'renvertHero'
        | 'job-openings'
        | 'logo-list'
        | 'person-list'
        | 'pricing-list'
        | 'richtext-module'
        | 'newsletterModule'
        | 'accordion-list'
        | 'videoHero';
      _key: string;
      options?: {
        hidden?: boolean;
        uid?: string;
      };
    }

    interface PricingComparisonTier {
      name: string;
      price: string;
      description: string;
      cta: CTA;
      popular: boolean;
    }

    interface SanityImage {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    }

    interface Video {
      type: 'mux' | 'youtube';
      videoId?: string;
      muxVideo?: {
        asset?: {
          playbackId?: string;
          data?: {
            playback_ids?: Array<{ id: string }>;
          };
        };
        playbackId?: string;
      };
      thumbnail: Sanity.Image;
      title: string;
    }

    export interface VideoHeroSanity {
      _type: 'videoHero';
      type: 'mux' | 'youtube';
      videoId: string;
      thumbnail: SanityImage;
      title: string;
    }

    interface VideoHero extends Module<'videoHero'> {
      type: 'mux' | 'youtube';
      videoId: string;
      thumbnail: SanityImage;
      title: string;
    }

    interface CustomerShowcaseModule extends Module<'customer-showcase'> {
      customers?: Array<{
        name: string;
        image?: {
          default?: any;
        };
        website?: string;
      }>;
    }

    interface ContactFormModule extends Module<'contactForm'> {
      title: string;
      description: string;
      serviceTypes: string[];
      contactInfo: {
        phone: string;
        email: string;
        address: string;
        openingHours: string[];
      };
      image?: any;
      privacyText: string;
      buttonText: string;
    }

    interface JobOpeningsModule extends Module {
      _type: 'job-openings';
      title?: string;
      subtitle?: string;
      jobs: Array<{
        title: string;
        location: string;
        applicationUrl: string;
        buttonText: string;
        reference: string;
      }>;
    }

    interface NewsletterModule {
      _type: 'newsletterModule';
      _key: string;
      title: string;
      description: string;
      buttonText: string;
      buttonLink: string;
      image: SanityImage;
    }

    interface PersonList {
      _type: 'person-list';
      _key: string;
      title: string;
      description: string;
      people: Person[];
    }
  }
}
