/**
 * Early Access Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-12-21
 */

import { MdEmail } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'earlyAccess',
  title: 'Early Access Signup',
  icon: MdEmail,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
    prepare: ({ title, subtitle }) => {
      return {
        title: title || 'Early Access Signup',
        subtitle: subtitle ? `${subtitle.substring(0, 50)}...` : 'Newsletter signup form',
        media: MdEmail,
      };
    },
  },
  fields: [
    // Content
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Main heading for the signup section',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
      initialValue: 'Vær blant de første!',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description:
        'Subtext explaining the early access offer. Note: The form collects user email and name.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      description: 'Text displayed on the submit button',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
      initialValue: 'Få tidlig tilgang',
    }),
    defineField({
      name: 'checkboxText',
      title: 'Checkbox Text',
      description: 'Text for the optional checkbox (e.g., "I have Airbnb property")',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
      initialValue: 'Jeg har Airbnb/korttidsutleie eiendom',
    }),
    defineField({
      name: 'privacyText',
      title: 'Privacy Text',
      description: 'Small print text below the form',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (Rule) => Rule.required(),
      initialValue: 'Begrenset antall plasser i beta-programmet. Vi deler aldri din e-post.',
    }),

    // Settings
    defineField({
      name: 'successTitle',
      title: 'Success Title',
      description: 'Title shown after successful submission',
      type: 'string',
      group: 'settings',
      initialValue: 'Takk for din interesse!',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      description: 'Message shown after successful submission',
      type: 'text',
      rows: 3,
      group: 'settings',
      initialValue:
        'Du er nå på ventelisten for RenVert. Vi gleder oss til å kontakte deg snart med mer informasjon.',
    }),
  ],
});
