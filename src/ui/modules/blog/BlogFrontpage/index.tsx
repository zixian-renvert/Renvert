import { fetchSanityLive } from '@/sanity/lib/fetch';
import { getLocale } from 'next-intl/server';
import { groq } from 'next-sanity';
import { stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import FilterList from '../BlogList/FilterList';
import PostPreview from '../PostPreview';
import PostPreviewLarge from '../PostPreviewLarge';
import Paginated from './Paginated';
import sortFeaturedPosts from './sortFeaturedPosts';

export default async function BlogFrontpage({
  mainPost,
  showFeaturedPostsFirst,
  itemsPerPage,
}: Partial<{
  mainPost: 'recent' | 'featured';
  showFeaturedPostsFirst: boolean;
  itemsPerPage: number;
  isTabbedModule?: boolean;
}>) {
  const locale = await getLocale();
  const posts = await fetchSanityLive<Sanity.BlogPost[]>({
    query: groq`*[_type == 'blog.post' && language == '${locale}']|order(publishDate desc){
			_type,
			_id,
			featured,
			metadata,
			categories[]->,
			authors[]->,
			publishDate,
      language,
		}`,
  });

  return (
    <section className="section space-y-12">
      <FilterList />
      <Suspense
        fallback={
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {Array.from({ length: itemsPerPage ?? 6 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <PostPreview skeleton />
              </li>
            ))}
          </ul>
        }
      >
        <Paginated
          posts={sortFeaturedPosts(posts, showFeaturedPostsFirst)}
          itemsPerPage={itemsPerPage}
        />
      </Suspense>
    </section>
  );
}
