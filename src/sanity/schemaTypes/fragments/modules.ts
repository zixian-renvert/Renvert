import { defineField } from 'sanity';

export default defineField({
  name: 'modules',
  description: 'Page content',
  type: 'array',
  of: [
    { type: 'videoHero' },
    { type: 'featuredHero' },
    { type: 'accordion-list' },
    { type: 'feature-grid' },
    { type: 'callout' },
    { type: 'richtext-module' },
    { type: 'blog-frontpage' },
    { type: 'blog-list' },
    { type: 'blog-post-content' },
    { type: 'breadcrumbs' },
    { type: 'renvertHero' },
    { type: 'newsletterModule' },
    { type: 'customer-showcase' },
    { type: 'contactForm' },
    { type: 'job-openings' },
    { type: 'earlyAccess' },
  ],
  options: {
    insertMenu: {
      views: [
        {
          name: 'grid',
          previewImageUrl: (schemaType) => `/admin/thumbnails/${schemaType}.webp`,
        },
        { name: 'list' },
      ],
      groups: [
        {
          name: 'Hero Sections',
          of: ['renvertHero', 'featuredHero', 'videoHero'],
        },
        {
          name: 'Content Blocks',
          of: [
            'richtext-module',
            'callout',
            'accordion-list',
            'newsletterModule',
            'contactForm',
            'job-openings',
            'feature-grid',
            'customer-showcase',
            'earlyAccess',
          ],
        },
        {
          name: 'Blog',
          of: ['blog-frontpage', 'blog-list', 'blog-post-content', 'breadcrumbs'],
        },
      ],
    },
  },
});
