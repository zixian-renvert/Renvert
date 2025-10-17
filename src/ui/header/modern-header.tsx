'use client';

import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';

import UserMenu from '@/components/UserMenu';
import { useAuth } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink, Menu, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { stegaClean } from 'next-sanity';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Types
interface Logo {
  name?: string;
  image?: {
    dark?: any;
    light?: any;
    default?: any;
  };
}

interface InternalLink {
  _type: string;
  title: string;
  slug?: { current: string };
  metadata: any;
  _id: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
}

interface NavLink {
  label: string;
  description?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
}

interface MenuItem {
  _type: 'link' | 'link.list';
  label?: string;
  title?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
  link?: NavLink;
  links?: NavLink[];
}

interface ModernHeaderProps {
  title?: string;
  logo?: Logo;
  ctas?: any[];
  headerMenu?: {
    items?: MenuItem[];
  };
}

const NavLinkComponent = ({
  link,
  onClick,
  className = '',
}: {
  link: NavLink;
  onClick?: () => void;
  className?: string;
}) => (
  <Link
    href={
      link.internal?.metadata?.slug?.current
        ? resolveUrl(link.internal as any, {
            base: false,
            params: link.params,
          })
        : link.external
          ? stegaClean(link.external)
          : '/'
    }
    className={cn(
      'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md',
      'hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
      className
    )}
    target={link.external ? '_blank' : undefined}
    aria-label={link.external ? `${link.label} (opens in new tab)` : undefined}
    onClick={onClick}
  >
    {link.label}
    {link.external && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
  </Link>
);

export default function ModernHeader({ title, logo, ctas, headerMenu }: ModernHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const { isSignedIn, isLoaded } = useAuth();

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set CSS custom property for header height
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function setHeight() {
      if (!headerRef.current) return;
      document.documentElement.style.setProperty(
        '--header-height',
        `${headerRef.current.offsetHeight ?? 0}px`
      );
    }

    setHeight();
    window.addEventListener('resize', setHeight);

    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const closeMobile = () => setIsMobileMenuOpen(false);
    window.addEventListener('popstate', closeMobile);
    return () => window.removeEventListener('popstate', closeMobile);
  }, []);

  // Get the appropriate logo based on scroll state
  const getCurrentLogo = () => {
    // Prefer light logo for the consistent light background
    return logo?.image?.light || logo?.image?.default || logo?.image?.dark;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full transition-colors duration-200 ease-out',
          'bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm'
        )}
        initial={false}
        animate={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        role="banner"
        aria-label="Site header"
      >
        <div className="mx-auto max-w-screen-xl px-6 md:px-8">
          <div className="flex h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href={locale === 'nb' ? '/' : `/${locale}`}
                className="flex items-center space-x-2"
                aria-label={`Return to ${title} homepage`}
              >
                {getCurrentLogo() ? (
                  <motion.div
                    key={isScrolled ? 'scrolled' : 'default'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="flex items-center gap-2"
                  >
                    <Img
                      height={64}
                      image={getCurrentLogo()}
                      alt={`${logo?.name || title} logo`}
                      priority
                      className="h-12 w-auto lg:h-14"
                    />
                    <span className="text-xl font-bold lg:text-2xl tracking-tight text-secondary">
                      Renvert
                    </span>
                  </motion.div>
                ) : (
                  <motion.span
                    className={cn(
                      'text-xl font-bold lg:text-2xl transition-colors duration-300',
                      'text-secondary tracking-tight'
                    )}
                    animate={{
                      color: '#00205B',
                    }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    Renvert
                  </motion.span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation - Right Aligned */}
            <div className="hidden lg:flex items-center ml-auto space-x-4">
              <nav
                className={cn(
                  'flex items-center space-x-1 transition-colors duration-300',
                  'text-secondary'
                )}
                aria-label="Main navigation"
              >
                {headerMenu?.items?.map((item, index) => {
                  const itemKey = `${item._type}-${item.label || ''}-${index}`;

                  if (item._type === 'link') {
                    return (
                      <NavLinkComponent
                        key={itemKey}
                        link={item as NavLink}
                        className="text-secondary/80 hover:text-primary transition-colors"
                      />
                    );
                  }

                  if (item._type === 'link.list') {
                    return (
                      <div
                        key={itemKey}
                        className="relative"
                        onMouseEnter={() => setOpenDropdown(itemKey)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <button
                          type="button"
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                            'text-secondary/80 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                          )}
                          onClick={() => setOpenDropdown(openDropdown === itemKey ? null : itemKey)}
                          aria-expanded={openDropdown === itemKey}
                        >
                          {item.link?.label}
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              openDropdown === itemKey && 'rotate-180'
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {openDropdown === itemKey && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
                              onMouseLeave={() => setOpenDropdown(null)}
                            >
                              {item.links?.map((link, linkIndex) => (
                                <NavLinkComponent
                                  key={`${itemKey}-${linkIndex}`}
                                  link={link}
                                  className="text-secondary/80 hover:text-primary hover:bg-slate-50 mx-1"
                                  onClick={() => setOpenDropdown(null)}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return null;
                })}
              </nav>

              {/* Desktop CTAs */}
              <CTAList ctas={ctas} className="flex items-center gap-3" />

              {/* Authentication Buttons - Desktop */}
              <div className="flex items-center gap-2 ml-4">
                {isLoaded && isSignedIn ? (
                  <UserMenu />
                ) : (
                  <Link
                    href={locale === 'nb' ? '/sign-in' : `/${locale}/sign-in`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Logg inn eller registrer deg"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Logg inn</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Header Controls */}
            <div className="ml-auto lg:hidden flex items-center gap-2">
              {/* Authentication Buttons - Mobile */}
              {isLoaded && isSignedIn ? (
                <UserMenu />
              ) : (
                <Link
                  href={locale === 'nb' ? '/sign-in' : `/${locale}/sign-in`}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Logg inn eller registrer deg"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Logg inn</span>
                </Link>
              )}

              {/* Hamburger Menu Button */}
              <button
                type="button"
                className={cn(
                  'p-2 rounded-md transition-colors duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'text-secondary hover:text-primary'
                )}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="lg:hidden fixed inset-x-0 z-40 bg-white border-b border-slate-200 shadow-lg"
            style={{ top: 'var(--header-height)' }}
            aria-label="Mobile navigation menu"
          >
            <div className="mx-auto max-w-screen-xl px-6 md:px-8 py-6">
              {/* Mobile CTAs */}
              <div className="mb-6">
                <CTAList ctas={ctas} className="flex flex-col gap-3" onClick={closeMobileMenu} />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4" aria-label="Mobile navigation">
                {headerMenu?.items?.map((item, index) => {
                  const itemKey = `mobile-${item._type}-${item.label || ''}-${index}`;

                  if (item._type === 'link') {
                    return (
                      <NavLinkComponent
                        key={itemKey}
                        link={item as NavLink}
                        className="block w-full text-secondary hover:text-primary hover:bg-slate-50 px-3 py-3 border-b border-slate-100"
                        onClick={closeMobileMenu}
                      />
                    );
                  }

                  if (item._type === 'link.list') {
                    return (
                      <div key={itemKey} className="border-b border-slate-100">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-3 py-3 text-secondary hover:text-primary hover:bg-slate-50"
                          onClick={() => setOpenDropdown(openDropdown === itemKey ? null : itemKey)}
                          aria-expanded={openDropdown === itemKey}
                        >
                          <span className="font-medium">{item.link?.label}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              openDropdown === itemKey && 'rotate-180'
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {openDropdown === itemKey && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="bg-slate-50"
                            >
                              {item.links?.map((link, linkIndex) => (
                                <NavLinkComponent
                                  key={`${itemKey}-${linkIndex}`}
                                  link={link}
                                  className="block w-full text-secondary/80 hover:text-primary hover:bg-slate-100 px-6 py-3"
                                  onClick={closeMobileMenu}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return null;
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
