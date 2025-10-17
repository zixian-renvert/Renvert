import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'jobOpenings',
  title: 'Job Openings',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Ledige stillinger',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      initialValue:
        'Utforsk våre nåværende jobbmuligheter og finn din neste karrieremulighet hos Kaizen Shipping',
    }),
    defineField({
      name: 'jobs',
      title: 'Jobs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Job Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'location',
              title: 'Location',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'applicationUrl',
              title: 'Application URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'Text to display on the application button',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'reference',
              title: 'Reference Number',
              type: 'string',
              description: 'Job reference number (e.g., KS-001)',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'location',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Job Openings',
      };
    },
  },
});
