import ContactForm, { type ContactFormProps } from '@/components/ContactForm';
import JobOpenings from '@/components/JobOpenings';
import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import Callout from './Callout';
import { CustomerShowcase } from './CustomerShowcase';
import EarlyAccess from './EarlyAccess';
import FeatureGrid from './FeatureGrid';
import FeaturedHero from './FeaturedHero';
import Newsletter from './Newsletter';
import PersonList from './PersonList';
import RichtextModule from './RichtextModule';
import VideoHero from './VideoHero';
import BlogFrontpage from './blog/BlogFrontpage';
import BlogList from './blog/BlogList';
import BlogPostContent from './blog/PostContent';
import RenVertHero from './hero/RenVertHero';

export default function Modules({
  modules,
  page,
  post,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page;
  post?: Sanity.BlogPost;
}) {
  return (
    <>
      {modules?.map((module) => {
        if (!module) return null;

        switch (module._type) {
          case 'accordion-list':
            return <AccordionList {...module} key={module._key} />;
          case 'blog-frontpage':
            return <BlogFrontpage {...module} key={module._key} />;
          case 'blog-list':
            return <BlogList {...module} key={module._key} />;
          case 'blog-post-content':
            return <BlogPostContent {...module} post={post} key={module._key} />;
          case 'breadcrumbs':
            return <Breadcrumbs {...module} currentPage={post || page} key={module._key} />;
          case 'callout':
            return <Callout {...module} key={module._key} />;
          case 'feature-grid':
            return <FeatureGrid {...module} key={module._key} />;
          case 'featuredHero':
            return <FeaturedHero {...module} key={module._key} />;
          case 'renvertHero':
            return <RenVertHero {...module} key={module._key} />;
          case 'job-openings':
            return <JobOpenings {...(module as Sanity.JobOpeningsModule)} key={module._key} />;
          case 'person-list':
            return <PersonList {...module} key={module._key} />;
          case 'richtext-module':
            return <RichtextModule {...module} key={module._key} />;
          case 'videoHero':
            return <VideoHero data={module as any} key={module._key} />;
          case 'newsletterModule':
            return <Newsletter {...module} key={module._key} />;
          case 'customer-showcase': {
            const pretitle = (module as any).pretitle || '';
            const rawTitle = (module as any).title || '';
            // Split the title and wrap 'kunder' in a span if present
            const parts = rawTitle.split(/(kunder)/i);
            const title =
              parts.length > 1 ? (
                <>
                  {parts.map((part: string, idx: number) =>
                    /kunder/i.test(part) ? (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </>
              ) : (
                rawTitle
              );
            return (
              <CustomerShowcase
                customers={(module as Sanity.CustomerShowcaseModule).customers || []}
                pretitle={pretitle}
                title={title}
                intro={(module as any).intro || ''}
                key={module._key}
              />
            );
          }
          case 'contactForm':
            return <ContactForm {...(module as unknown as ContactFormProps)} key={module._key} />;
          case 'earlyAccess':
            return <EarlyAccess {...module} key={module._key} />;
          default:
            return <div data-type={module._type} key={module._key} />;
        }
      })}
    </>
  );
}
