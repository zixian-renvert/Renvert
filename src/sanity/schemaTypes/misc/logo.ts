import { VscVerified } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'logo',
  title: 'Logo',
  icon: VscVerified,
  type: 'document',
  description:
    'Represents a customer or partner logo, including image variants and an optional website URL.',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The name of the customer or partner represented by this logo.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Logo Images',
      type: 'object',
      description: 'Upload logo images for different backgrounds (default, light, dark).',
      options: {
        columns: 3,
      },
      fields: [
        defineField({
          name: 'default',
          title: 'Default',
          type: 'image',
          description: 'Main logo image (used by default).',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'light',
          title: 'Light Background',
          description: 'Logo for use on light backgrounds.',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'dark',
          title: 'Dark Background',
          description: 'Logo for use on dark backgrounds.',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      description: 'Link to the customer or partner website (optional).',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image.default',
    },
    prepare: ({ title, media }) => ({
      title,
      subtitle: 'Logo',
      media,
    }),
  },
});
