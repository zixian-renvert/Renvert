/**
 * RenVert Hero Section Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-12-21
 */

import { BsColumns } from 'react-icons/bs';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'renvertHero',
  title: 'RenVert Hero Section',
  icon: BsColumns,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'logo', title: 'Logo & Branding' },
  ],
  preview: {
    select: {
      title: 'title',
      pretitle: 'pretitle',
      media: 'logo',
    },
    prepare: ({ title, pretitle, media }) => {
      return {
        title: title || 'RenVert Hero Section',
        subtitle: pretitle || 'RenVert Hero',
        media: media || BsColumns,
      };
    },
  },
  fields: [
    // Logo & Branding
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'img',
      group: 'logo',
      validation: (Rule) => Rule.required(),
    }),

    // Content
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      description: 'Add buttons for the hero section (maximum 2)',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content',
      validation: (Rule) => Rule.max(2),
    }),
  ],
});
