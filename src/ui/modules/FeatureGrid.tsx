'use client';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Icon from '@/ui/Icon';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function FeatureGrid({
  title,
  subtitle,
  items,
  ctaLabel,
  ctaLink,
  alternateBackground = false,
  ...props
}: Partial<{
  title?: string;
  subtitle?: string;
  items: {
    title: string;
    subtitle: string;
    icon?: Sanity.Icon;
    _key: string;
    ctaLabel?: string;
    ctaLink?: string;
  }[];
  ctaLabel?: string;
  ctaLink?: string;
  alternateBackground?: boolean;
}> &
  Sanity.Module) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Handler for CTA button and card click
  const _handleServiceClick = (_title: string) => {
    // Replace with your own logic (e.g., open modal, scroll, etc.)
    window.location.href = '#kontakt';
  };

  return (
    <section
      className={cn(
        'py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden'
      )}
      {...moduleProps({
        ...props,
        options: { ...(props.options || {}), uid: 'tjenester' },
      })}
    >
      <div className="max-w-7xl mx-auto text-balance relative">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center text-balance mb-16">
            <div className="inline-block">
              <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                {title || 'Våre tjenester'}
              </h2>
              <div className="h-1 w-1/2 bg-[#CF3D45] mx-auto mb-4" />
            </div>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Services Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
          {items?.map((item, index) => {
            const isHovered = hoveredCard === item._key;
            return (
              <Item
                key={item._key}
                item={item}
                index={index}
                isHovered={isHovered}
                setHoveredCard={setHoveredCard}
                alternateBackground={alternateBackground}
              />
            );
          })}
        </div>

        {/* CTA Button */}
        {ctaLabel && ctaLink && (
          <div className="text-center mt-16">
            {ctaLink.startsWith('http') ? (
              <a
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#CF3E46] to-[#CF3E46] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {ctaLabel}
                <span className="ml-2">→</span>
              </a>
            ) : (
              <Link
                href={ctaLink}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#CF3E46] to-[#CF3E46] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {ctaLabel}
                <span className="ml-2">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const Item = ({
  item,
  index,
  isHovered,
  setHoveredCard,
  alternateBackground,
}: {
  item: {
    title: string;
    subtitle: string;
    icon?: Sanity.Icon;
    _key: string;
    ctaLabel?: string;
    ctaLink?: string;
  };
  index: number;
  isHovered: boolean;
  setHoveredCard: (key: string | null) => void;
  alternateBackground: boolean;
}) => {
  if (!item) return null;

  // Calculate content-aware styling
  const titleLength = item.title?.length || 0;
  const subtitleLength = item.subtitle?.length || 0;
  const isLongContent = titleLength > 20 || subtitleLength > 100;

  // Determine background based on alternating option and index
  const shouldUseAlternateBackground = alternateBackground && index % 2 === 1;
  const cardBackgroundClass = shouldUseAlternateBackground
    ? 'bg-[hsl(var(--feature-grid-alternate))]'
    : 'bg-gray-50';

  if (item.ctaLink) {
    return (
      <motion.a
        href={item.ctaLink}
        className="group relative flex"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onHoverStart={() => setHoveredCard(item._key)}
        onHoverEnd={() => setHoveredCard(null)}
      >
        <motion.div
          className={cn(
            'relative flex flex-col w-full rounded-2xl border border-gray-200 cursor-pointer overflow-hidden transition-all duration-300',
            'p-6 md:p-8', // Responsive padding
            cardBackgroundClass,
            isHovered ? 'border-[#CF3E46] shadow-xl' : ''
          )}
          whileHover={{
            scale: 1.02, // Reduced scale for better stability with long content
            boxShadow: '0 20px 40px rgba(207, 62, 70, 0.15)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background gradient overlay on hover */}
          <motion.div
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-[#CF3E46] to-[#CF3E46] opacity-0 pointer-events-none',
              'group-hover:opacity-5 transition-opacity duration-300'
            )}
          />

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#CF3E46] to-[#CF3E46] text-white mb-4 md:mb-6 relative z-10 overflow-hidden transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
            {item.icon && <Icon icon={item.icon} className="w-6 h-6 md:w-8 md:h-8" size={32} />}
          </div>

          {/* Content - Flexible container */}
          <div className="relative z-10 flex-1 flex flex-col">
            <h3
              className={cn(
                'font-bold text-gray-900 group-hover:text-[#CF3E46] transition-colors leading-tight mb-3 md:mb-4',
                isLongContent
                  ? 'text-lg md:text-xl lg:text-2xl' // Smaller for long content
                  : 'text-xl md:text-2xl lg:text-3xl' // Standard size
              )}
            >
              {item.title}
            </h3>
            {item.subtitle && (
              <p
                className={cn(
                  'text-gray-700 group-hover:text-[#CF3E46] transition-colors leading-relaxed flex-1',
                  isLongContent
                    ? 'text-sm md:text-base' // Smaller for long content
                    : 'text-base md:text-lg', // Standard size
                  subtitleLength > 150 && 'line-clamp-4' // Clamp very long content
                )}
              >
                {item.subtitle}
              </p>
            )}
            {/* Card CTA Label as indicator, not a button */}
            {item.ctaLabel && (
              <div className="mt-4 pt-2 text-[#CF3E46] text-sm md:text-base font-medium opacity-100 group-hover:opacity-100 transition-opacity duration-300 border-t border-gray-200 group-hover:border-[#CF3E46]/20">
                {item.ctaLabel}
              </div>
            )}
          </div>

          {/* Hover effect decoration */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CF3E46] to-transparent opacity-0 group-hover:opacity-30"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.a>
    );
  }
  return (
    <motion.div
      className="group relative flex"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onHoverStart={() => setHoveredCard(item._key)}
      onHoverEnd={() => setHoveredCard(null)}
    >
      <motion.div
        className={cn(
          'relative flex flex-col w-full rounded-2xl border border-gray-200 cursor-pointer overflow-hidden transition-all duration-300',
          'p-6 md:p-8', // Responsive padding
          cardBackgroundClass,
          isHovered ? 'border-[#CF3E46] shadow-xl' : ''
        )}
        whileHover={{
          scale: 1.02, // Reduced scale for better stability with long content
          boxShadow: '0 20px 40px rgba(207, 62, 70, 0.15)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background gradient overlay on hover */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-[#CF3E46] to-[#CF3E46] opacity-0 pointer-events-none',
            'group-hover:opacity-5 transition-opacity duration-300'
          )}
        />

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#CF3E46] to-[#CF3E46] text-white mb-4 md:mb-6 relative z-10 overflow-hidden transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
          {item.icon && <Icon icon={item.icon} className="w-6 h-6 md:w-8 md:h-8" size={32} />}
        </div>

        {/* Content - Flexible container */}
        <div className="relative z-10 flex-1 flex flex-col">
          <h3
            className={cn(
              'font-bold text-gray-900 group-hover:text-[#CF3E46] transition-colors leading-tight mb-3 md:mb-4',
              isLongContent
                ? 'text-lg md:text-xl lg:text-2xl' // Smaller for long content
                : 'text-xl md:text-2xl lg:text-3xl' // Standard size
            )}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p
              className={cn(
                'text-gray-700 group-hover:text-[#CF3E46] transition-colors leading-relaxed flex-1',
                isLongContent
                  ? 'text-sm md:text-base' // Smaller for long content
                  : 'text-base md:text-lg', // Standard size
                subtitleLength > 150 && 'line-clamp-4' // Clamp very long content
              )}
            >
              {item.subtitle}
            </p>
          )}
          {/* Card CTA Label as indicator, not a button */}
          {item.ctaLabel && (
            <div className="mt-4 pt-2 text-[#CF3E46] text-sm md:text-base font-medium opacity-100 group-hover:opacity-100 transition-opacity duration-300 border-t border-gray-200 group-hover:border-[#CF3E46]/20">
              {item.ctaLabel}
            </div>
          )}
        </div>

        {/* Hover effect decoration */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CF3E46] to-transparent opacity-0 group-hover:opacity-30"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};
