import { cn } from '@/lib/utils';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import Pretitle from '@/ui/Pretitle';
import FilterList from '@/ui/modules/blog/BlogList/FilterList';
import { groq } from 'next-sanity';
import { PortableText, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import PostPreview from '../PostPreview';
import List from './List';

export default async function BlogList({
  pretitle,
  intro,
  layout,
  limit,
  showFeaturedPostsFirst,
  displayFilters,
  filteredCategory,
}: Partial<{
  pretitle: string;
  intro: any;
  layout: 'grid' | 'carousel';
  limit: number;
  showFeaturedPostsFirst: boolean;
  displayFilters: boolean;
  filteredCategory: Sanity.BlogCategory;
  isTabbedModule?: boolean;
}>) {
  const posts = await fetchSanityLive<Sanity.BlogPost[]>({
    query: groq`
			*[
				_type == 'blog.post'
				${filteredCategory ? '&& $filteredCategory in categories[]->._id' : ''}
			]|order(
				${showFeaturedPostsFirst ? 'featured desc, ' : ''}
				publishDate desc
			)
			${limit ? `[0...${limit}]` : ''}
			{
				...,
				categories[]->,
				authors[]->
			}
		`,
    params: {
      filteredCategory: filteredCategory?._id || '',
      limit: limit ?? 0,
    },
  });

  const listClassName = cn(
    'items-stretch gap-x-8 gap-y-12',
    stegaClean(layout) === 'grid'
      ? 'grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'
      : 'carousel max-xl:full-bleed md:overflow-fade-r pb-4 [--size:320px] max-xl:px-4'
  );

  return (
    <section className="section space-y-8">
      {intro && (
        <header className="richtext">
          <Pretitle>{pretitle}</Pretitle>
          <PortableText value={intro} />
        </header>
      )}

      {displayFilters && !filteredCategory && <FilterList />}

      <Suspense
        fallback={
          <ul className={listClassName}>
            {Array.from({ length: limit ?? 6 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <PostPreview skeleton />
              </li>
            ))}
          </ul>
        }
      >
        <List posts={posts} className={listClassName} />
      </Suspense>
    </section>
  );
}
