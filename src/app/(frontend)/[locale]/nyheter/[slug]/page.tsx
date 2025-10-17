import processMetadata from '@/lib/processMetadata';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY, TRANSLATIONS_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { groq } from 'next-sanity';
import { notFound, redirect } from 'next/navigation';

export default async function Page({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const post = await getPost(await params);
  if (!post) notFound();
  return <Modules modules={post.modules} post={post} />;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const post = await getPost(await params);
  if (!post) notFound();
  return processMetadata(post);
}

export async function generateStaticParams() {
  const posts = await client.fetch<{ slug: string; locale: string }[]>(
    groq`*[_type == 'blog.post' && defined(metadata.slug.current)]{
      'slug': metadata.slug.current,
      'locale': language
    }`
  );

  return posts
    .filter(({ locale }) => locale && typeof locale === 'string')
    .map(({ slug, locale }) => ({ slug, locale }));
}

async function getPost(params: Params) {
  const blogTemplateExists = await fetchSanityLive<boolean>({
    query: groq`count(*[_type == 'global-module' && path == 'nyheter/']) > 0`,
  });

  if (!blogTemplateExists)
    throw new Error(
      'Missing blog template: 👻 Oof, your blog posts are ghosting...\n\n' +
        'Solution: Add a new Global module document in your Medal Social Studio with the path "nyheter/".\n' +
        'Also add the Blog post content module to display blog post content.\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );
  const { slug, locale } = params;

  // First, try to get the blog post in the requested locale
  const post = await fetchSanityLive<Sanity.BlogPost & { modules: Sanity.Module[] }>({
    query: groq`*[_type == 'blog.post' && metadata.slug.current == $slug && ${locale ? `language == '${locale}'` : ''}][0]{
			...,
			body[]{
				...,
				_type == 'image' => { asset-> }
			},
			'readTime': length(string::split(pt::text(body), ' ')) / 200,
			'headings': body[style in ['h2', 'h3']]{
				style,
				'text': pt::text(@)
			},
			categories[]->,
			authors[]->,
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// path modules (before)
				+ *[_type == 'global-module' && path == '${locale === 'nb' ? '' : `${locale}/`}nyheter/'].before[]{ ${MODULES_QUERY} }
				// path modules (after)
				+ *[_type == 'global-module' && path == '${locale === 'nb' ? '' : `${locale}/`}nyheter/'].after[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			),
			${TRANSLATIONS_QUERY},

		}`,
    params,
  });

  // If post doesn't exist in requested locale and locale is not the default (nb),
  // check if Norwegian version exists and redirect to it
  if (!post && locale && locale !== 'nb') {
    const norwegianPost = await fetchSanityLive<{
      metadata: { slug: { current: string } };
    }>({
      query: groq`*[_type == 'blog.post' && metadata.slug.current == $slug && language == 'nb'][0]{
				metadata { slug }
			}`,
      params,
    });

    if (norwegianPost) {
      // Redirect to Norwegian URL (remove /en prefix)
      redirect(`/nyheter/${slug}`);
    }
  }

  return post;
}

type Params = { slug: string; locale: Locale };

type Props = {
  params: Promise<Params>;
};
