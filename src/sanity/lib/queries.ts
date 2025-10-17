import { groq } from 'next-sanity';
import { fetchSanityLive } from './fetch';

export const SLUG_QUERY = groq`
	array::join([...parent[]->metadata.slug.current, metadata.slug.current], '/')
`;

export const LINK_QUERY = groq`
	...,
	internal->{
		_type,
		title,
		parent[]->{ metadata { slug } },
		metadata,
		language
	}
`;

export const NAVIGATION_QUERY = groq`
	title,
	items[]{
		${LINK_QUERY},
		link{ ${LINK_QUERY} },
		links[]{ ${LINK_QUERY} },
		categories[]{
		...,
			links[]{ ${LINK_QUERY} }
		}
	}
`;

export const CTA_QUERY = groq`
	...,
	link{ ${LINK_QUERY} },
		internalLink-> {
		...
	}
`;

export const MODULES_QUERY = groq`
	...,
	ctas[]{${CTA_QUERY}},
	_type == 'blog-list' => { filteredCategory-> },
	_type == 'breadcrumbs' => { crumbs[]{ ${LINK_QUERY} } },
	_type == 'callout' => {
		"copy": content,
	},
	_type == 'hero.saas' => {
		content[]
	},
	_type == 'person-list' => { 
		...,
		people[]->{...,  "image": image.asset->, altText, loading},
	},
	_type == 'richtext-module' => {
		'headings': select(
			tableOfContents => content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
				style,
				'text': pt::text(@)
			}
		),
	},
	_type == 'featuredHero' => {
		ctas[]{ ${CTA_QUERY} },
		content[],
		image{..., "image": image.asset->, altText, loading}
	},
	_type == 'feature-grid' => {
		...,
		items[]{
			...,
			link{ ${LINK_QUERY} }
		}
	},
	_type == 'videoHero' => {
		_type,
		type,
		videoId,
		muxVideo{
			...,
			asset->{
				...,
				"playbackId": playback_ids[0].id
			}
		},
		thumbnail,
		title
	},
	_type == 'customer-showcase' => {
		badge,
		title,
		intro,
		customers[]->
	},
`;

export const GLOBAL_MODULE_QUERY = groq`
	string::startsWith($slug, path)
	&& select(
		defined(excludePaths) => count(excludePaths[string::startsWith($slug, @)]) == 0,
		true
	)
`;
export const TRANSLATIONS_QUERY = groq`
	'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
		'slug': metadata.slug.current,
		language
	}
`;

export async function getTranslations() {
  return await fetchSanityLive<Sanity.Translation[]>({
    query: groq`*[_type in ['page', 'blog.post'] && defined(language)]{
			'slug': '/' + select(
				_type == 'blog.post' => 'nyheter/' + metadata.slug.current,
				metadata.slug.current != 'index' => metadata.slug.current,
				''
			),
			'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
				'slug': '/' + select(
					_type == 'blog.post' => 'nyheter/' + language + '/' + metadata.slug.current,
					metadata.slug.current != 'index' => language + '/' + metadata.slug.current,
					language
				),
				_type == 'blog.post' => {
					'slugBlogAlt': '/' + language + '/nyheter/' + metadata.slug.current
				},
				language
			}
		}`,
  });
}
