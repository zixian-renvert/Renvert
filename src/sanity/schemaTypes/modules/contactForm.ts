import { MdOutlineContactMail } from 'react-icons/md';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contactForm',
  title: 'Contact Form',
  type: 'object',
  icon: MdOutlineContactMail,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        { name: 'phone', title: 'Phone', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'address', title: 'Address', type: 'text' },
        { name: 'openingHours', title: 'Opening Hours', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
    }),
    defineField({
      name: 'privacyText',
      title: 'Privacy Text',
      type: 'text',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      initialValue: 'Send',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
});
