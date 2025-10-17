import { VscBriefcase } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'job-openings',
  title: 'Job Openings',
  icon: VscBriefcase,
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
              initialValue: 'Søk nå',
            }),
            defineField({
              name: 'reference',
              title: 'Reference Number',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      jobs: 'jobs',
    },
    prepare: ({ title, jobs = [] }) => ({
      title: title || 'Job Openings',
      subtitle: `${jobs.length} position${jobs.length === 1 ? '' : 's'}`,
    }),
  },
});
