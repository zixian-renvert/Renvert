'use client';

import { groq } from 'next-sanity';
import { defineLocations, presentationTool } from 'sanity/presentation';

export const presentation = presentationTool({
  name: 'editor',
  title: 'Editor',
  previewUrl: {
    previewMode: {
      enable: '/api/draft-mode/enable',
    },
  },
  resolve: {
    mainDocuments: [
      {
        route: '/',
        filter: groq`_type == 'page' && metadata.slug.current == 'index' && language == 'nb'`,
      },
      {
        route: '/en',
        filter: groq`_type == 'page' && metadata.slug.current == 'index' && language == 'en'`,
      },
      {
        route: '/:slug',
        filter: groq`
					_type == 'page' &&
					array::join([...parent[]->metadata.slug.current, metadata.slug.current], '/') == $slug &&
					language == 'nb'
				`,
      },
      {
        route: '/en/:slug',
        filter: groq`
					_type == 'page' &&
					array::join([...parent[]->metadata.slug.current, metadata.slug.current], '/') == $slug &&
					language == 'en'
				`,
      },
      {
        route: '/nyheter/:slug',
        filter: groq`_type == 'blog.post' && metadata.slug.current == $slug && language == 'nb'`,
      },
      {
        route: '/en/nyheter/:slug',
        filter: groq`_type == 'blog.post' && metadata.slug.current == $slug && language == 'en'`,
      },
    ],
    locations: {
      site: defineLocations({
        message: 'This document is used on all pages',
        locations: [
          {
            title: 'Home',
            href: '/',
          },
        ],
      }),
      page: defineLocations({
        select: {
          title: 'title',
          parent1: 'parent.0.metadata.slug.current',
          parent2: 'parent.1.metadata.slug.current',
          parent3: 'parent.2.metadata.slug.current',
          metaTitle: 'metadata.title',
          slug: 'metadata.slug.current',
          language: 'language',
        },
        resolve: (doc) => {
          const languagePrefix = doc?.language === 'nb' ? '' : `/${doc?.language}`;

          return {
            locations: [
              {
                title: doc?.title || doc?.metaTitle || 'Untitled',
                href: [
                  languagePrefix,
                  doc?.parent1 &&
                    `/${[doc.parent1, doc.parent2, doc.parent3].filter(Boolean).join('/')}`,
                  doc?.slug ? (doc.slug === 'index' ? '/' : `/${doc.slug}`) : '/',
                ]
                  .filter(Boolean)
                  .join(''),
              },
            ],
          };
        },
      }),
      'blog.post': defineLocations({
        select: {
          title: 'metadata.title',
          slug: 'metadata.slug.current',
          language: 'language',
        },
        resolve: (doc) => {
          const languagePrefix = doc?.language === 'nb' ? '' : `/${doc?.language}`;

          return {
            locations: [
              {
                title: doc?.title || 'Untitled',
                href: doc?.slug
                  ? `${languagePrefix}/nyheter/${doc.slug}`
                  : `${languagePrefix}/nyheter`,
              },
            ],
          };
        },
      }),
      'blog.category': defineLocations({
        select: {
          title: 'title',
          slug: 'slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug ? `/nyheter?category=${doc.slug}` : '/nyheter',
            },
          ],
        }),
      }),
      help: defineLocations({
        select: {
          title: 'title',
          parent1: 'parent.0.metadata.slug.current',
          parent2: 'parent.1.metadata.slug.current',
          parent3: 'parent.2.metadata.slug.current',
          metaTitle: 'metadata.title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || doc?.metaTitle || 'Untitled',
              href: [
                doc?.parent1 &&
                  `/help/${[doc.parent1, doc.parent2, doc.parent3].filter(Boolean).join('/')}`,
                doc?.slug ? (doc.slug === 'index' ? '/' : `/${doc.slug}`) : '/',
              ]
                .filter(Boolean)
                .join(''),
            },
          ],
        }),
      }),
      'help-page': defineLocations({
        select: {
          title: 'title',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: '/help',
            },
          ],
        }),
      }),
      event: defineLocations({
        select: {
          title: 'title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug ? `/events/${doc.slug}` : '/events',
            },
          ],
        }),
      }),
    },
  },
});
