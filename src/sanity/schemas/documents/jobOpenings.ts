import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'jobOpenings',
  title: 'Job Openings',
  type: 'document',
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
});
