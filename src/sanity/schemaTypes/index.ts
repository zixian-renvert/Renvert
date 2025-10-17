import type { SchemaTypeDefinition } from 'sanity';

// documents
import blogCategory from './documents/blog.category';
import blogPost from './documents/blog.post';
import globalModule from './documents/global-module';

import navigation from './documents/navigation';
import page from './documents/page';
import redirect from './documents/redirect';
import site from './documents/site';

// miscellaneous
import announcement from './misc/announcement';
import logo from './misc/logo';
import person from './misc/person';
import pricing from './misc/pricing';

// objects
import modules from './fragments/modules';
import cta from './objects/cta';
import icon from './objects/icon';
import img from './objects/img';
import link from './objects/link';
import linkList from './objects/link.list';
import metadata from './objects/metadata';
import moduleOptions from './objects/module-options';
import stat from './objects/stat';

// modules
import accordionList from './modules/accordion-list';
import blogFrontpage from './modules/blog-frontpage';
import blogList from './modules/blog-list';
import blogPostContent from './modules/blog-post-content';
import breadcrumbs from './modules/breadcrumbs';
import callout from './modules/callout';
import contactForm from './modules/contactForm';
import customerShowcase from './modules/customer-showcase';
import earlyAccess from './modules/early-access';
import featureGrid from './modules/feature-grid';
import featuredHero from './modules/featured-hero';
import jobOpenings from './modules/job-openings';
import newsletterModule from './modules/newsletterModule';
import personList from './modules/person-list';
import pricingList from './modules/pricing-list';
import renvertHero from './modules/renvert-hero';
import richtextModule from './modules/richtext-module';
import videoHero from './modules/video-hero';

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  blogCategory,
  blogPost,
  globalModule,
  page,
  redirect,
  site,
  navigation,

  // miscellaneous
  announcement,
  logo,
  person,
  pricing,

  // objects
  cta,
  icon,
  img,
  link,
  linkList,
  metadata,
  moduleOptions,
  stat,

  // modules
  accordionList,
  blogFrontpage,
  blogList,
  blogPostContent,
  breadcrumbs,
  callout,
  contactForm,
  customerShowcase,
  earlyAccess,
  featureGrid,
  featuredHero,
  jobOpenings,
  newsletterModule,
  personList,
  pricingList,
  richtextModule,
  renvertHero,
  videoHero,
  modules,
];
