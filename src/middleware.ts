import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Simple middleware that only handles internationalization
// No security restrictions - allows everything
const translationMiddleware = createMiddleware(routing);

export default translationMiddleware;

export const config = {
  matcher: ['/((?!favicon\\.ico|_next|api|admin|sitemap\\.xml|sitemap\\.xsl|robots\\.txt).*)'],
};
