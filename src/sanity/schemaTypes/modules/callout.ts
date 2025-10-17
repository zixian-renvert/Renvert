import { getBlockText } from '@/sanity/lib/utils';
import { VscInspect } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'callout',
  title: 'Callout',
  icon: VscInspect,
  type: 'object',
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pre-title',
      description: 'Small badge text displayed above the title',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      pretitle: 'pretitle',
    },
    prepare: ({ heading, pretitle }) => ({
      title: heading,
      subtitle: pretitle || 'Callout',
    }),
  },
});
