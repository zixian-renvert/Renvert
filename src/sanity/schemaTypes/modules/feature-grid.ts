/**
 * Feature Grid Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.1.0: Added alignment options and improved validation
 * - 1.0.0: Initial version
 */

import { getBlockText } from '@/sanity/lib/utils';
import { Grid2x2 } from 'lucide-react';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'feature-grid',
  title: 'Feature grid',
  type: 'object',
  icon: Grid2x2,
  description: 'Grid layout of features with icons and descriptions',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main heading for the feature grid',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional subtitle or supporting text for the feature grid',
    }),
    defineField({
      name: 'alternateBackground',
      title: 'Alternate Background Colors',
      type: 'boolean',
      description: 'Enable alternating background colors for visual separation between cards',
      initialValue: false,
    }),
    defineField({
      name: 'items',
      title: 'Features',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'subtitle',
              type: 'string',
              title: 'Subtitle',
              description: 'A short summary or tagline for this feature.',
            }),
            defineField({ name: 'icon', type: 'icon' }),
            defineField({
              name: 'ctaLabel',
              type: 'string',
              title: 'CTA Label',
              description: 'Text for the card call-to-action indicator',
            }),
            defineField({
              name: 'ctaLink',
              type: 'url',
              validation: (Rule) => Rule.uri({ allowRelative: true }),
              title: 'CTA Link',
              description: 'URL for the card call-to-action',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'subtitle',
              icon: 'icon',
              ctaLabel: 'ctaLabel',
            },
            prepare: ({ title, subtitle, icon, ctaLabel }) => ({
              title,
              subtitle: (subtitle || '') + (ctaLabel ? ` • CTA: ${ctaLabel}` : ''),
              media: icon,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('At least one feature is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      items: 'items',
      alternateBackground: 'alternateBackground',
    },
    prepare: ({ title, subtitle, items, alternateBackground }) => ({
      title: title || 'Feature grid',
      subtitle: `${subtitle ? `${subtitle} • ` : ''}${items?.length || 0} features${alternateBackground ? ' • Alternating backgrounds' : ''}`,
      media: Grid2x2,
    }),
  },
});
