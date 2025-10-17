import { VscSymbolMisc } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'customer-showcase',
  title: 'Customer Showcase',
  icon: VscSymbolMisc,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pre-title',
      type: 'string',
      group: 'content',
      description: 'Small badge text displayed above the title',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'Main heading for the customer showcase section (e.g., Våre fornøyde kunder).',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      group: 'content',
      description: 'Introductory text for the customer showcase section.',
    }),
    defineField({
      name: 'customers',
      title: 'Customers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'logo' }] }],
      description:
        'Select customers to display. Each customer should have a logo (with url) and optional website. Leave empty to show all.',
      group: 'content',
    }),
    // Future: testimonials, options, etc.
  ],
  preview: {
    select: {
      pretitle: 'pretitle',
      intro: 'intro',
    },
    prepare: ({ pretitle }) => ({
      title: pretitle || 'Customer Showcase',
      subtitle: 'Customer Showcase',
    }),
  },
});
