import { getBlockText } from '@/sanity/lib/utils';
import { TfiLayoutAccordionMerged } from 'react-icons/tfi';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'accordion-list',
  title: 'Accordion list',
  type: 'object',
  icon: TfiLayoutAccordionMerged,
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'isFullWidth',
      description:
        'If true, the accordion list will be full width. If false, the accordion list will be styled typical FAQ style.',
      type: 'boolean',
      initialValue: false,
      group: 'options',
    }),
    defineField({
      name: 'pretitle',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          icon: TfiLayoutAccordionMerged,
          fields: [
            defineField({
              name: 'summary',
              type: 'string',
            }),
            defineField({
              name: 'content',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              name: 'open',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'summary',
              content: 'content',
            },
            prepare: ({ title, content }) => ({
              title,
              subtitle: getBlockText(content),
            }),
          },
        }),
      ],
      group: 'content',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      options: {
        layout: 'radio',
        list: ['vertical', 'horizontal'],
      },
      initialValue: 'vertical',
      group: 'options',
    }),
    defineField({
      name: 'generateSchema',
      title: 'Generate schema.org schema',
      type: 'boolean',
      description: 'Recommended for FAQ content',
      initialValue: false,
      group: 'options',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
    },
    prepare: ({ intro }) => ({
      title: getBlockText(intro),
      subtitle: 'Accordion list',
    }),
  },
});
