import { count } from '@/lib/utils';
import { VscSymbolField } from 'react-icons/vsc';
import { defineArrayMember, defineField, defineType } from 'sanity';
import modules from '../fragments/modules';

export default defineType({
  name: 'global-module',
  title: 'Global module',
  type: 'document',
  icon: VscSymbolField,
  fields: [
    defineField({
      name: 'path',
      type: 'string',
      description:
        'URL path to add modules. Use * for all pages. A trailing slash (/) excludes the parent path.',
      placeholder: 'e.g. *, blog/, foo/bar/, etc.',
    }),
    defineField({
      name: 'excludePaths',
      type: 'array',
      description:
        'URL paths to exclude modules from being added. A trailing slash (/) excludes the parent path.',
      of: [
        defineArrayMember({
          type: 'string',
          placeholder: 'e.g. blog/, foo/bar/, etc.',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      ...modules,
      name: 'before',
      description: 'Modules to add before the page content',
    }),
    defineField({
      ...modules,
      name: 'after',
      description: 'Modules to add after the page content',
    }),
  ],
  preview: {
    select: {
      path: 'path',
      before: 'before',
      after: 'after',
    },
    prepare: ({ path, before, after }) => ({
      title: count([...(before ?? []), ...(after ?? [])], 'module'),
      subtitle: path === '*' ? 'All pages' : path && `/${path}*`,
    }),
  },
});
