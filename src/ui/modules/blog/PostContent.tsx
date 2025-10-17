'use client';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import DateDisplay from '@/ui/Date';
import Content from '@/ui/modules/RichtextModule/Content';
import { Calendar } from 'lucide-react';
import Authors from './Authors';
import Categories from './Categories';
import css from './PostContent.module.css';
import ReadTime from './ReadTime';
import { SocialShare } from './SocialShare';

export default function PostContent({
  post,
  ...props
}: { post?: Sanity.BlogPost } & Sanity.Module & { isTabbedModule?: boolean }) {
  if (!post || !post.metadata) return null;

  return (
    <div className={cn('section')} {...moduleProps(props)}>
      <article aria-describedby={undefined}>
        <header className="space-y-4 pt-4 pb-8 text-start max-w-screen-md">
          <Categories
            className="flex flex-wrap gap-x-2"
            categories={post.categories}
            linked
            badge
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight  mb-4 leading-tight">
            {post.metadata.title}
          </h1>

          <div className="flex flex-wrap items-start justify-start gap-x-6 gap-y-2">
            <div className="flex items-center gap-x-2">
              <Calendar className="size-4" />
              <DateDisplay value={post.publishDate} />
            </div>
            <ReadTime value={post.readTime} />
            <div className="ml-auto">
              <SocialShare
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={post.metadata.title}
                description={post.metadata.description || ''}
                image={post.metadata.ogimage || ''}
                vertical={false}
              />
            </div>
          </div>
        </header>

        {post.authors?.length && (
          <div className="flex items-center gap-5 border-t pt-6 mb-8">
            <Authors
              className="flex flex-wrap items-start justify-start gap-4"
              authors={post.authors}
              bio
              socialLinks
            />
          </div>
        )}

        <div>
          <Content value={post.body} className={cn(css.body, 'prose mb-8')} />
        </div>
      </article>
    </div>
  );
}
