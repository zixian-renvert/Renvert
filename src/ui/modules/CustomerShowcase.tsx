'use client';
import { urlFor } from '@/sanity/lib/image';
import type React from 'react';

export type Customer = {
  name: string;
  image?: {
    default?: any;
  };
  logo?:
    | {
        url: string;
      }
    | string; // Accepts object (new) or string (legacy)
  url?: string;
};

export type CustomerShowcaseProps = {
  customers: Customer[];
  pretitle: string;
  title: React.ReactNode;
  intro: string;
};

export const CustomerShowcase: React.FC<CustomerShowcaseProps> = ({
  customers,
  pretitle,
  title,
  intro,
}) => {
  // Duplicate the logos for seamless scrolling
  const duplicatedLogos = [...customers, ...customers];

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          {pretitle && pretitle.trim() !== '' && (
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-white rounded-full" />
              {pretitle}
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{intro}</p>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10" />

          {/* First Row - Moving Right */}
          <div className="flex gap-8 mb-8 animate-scroll-right">
            {duplicatedLogos.map((customer, index) => {
              // Prefer logo.url if present, otherwise fallback to website
              const logoUrl = customer.image?.default ? urlFor(customer.image.default).url() : null;
              // Use customer.url (from logo doc) if present, otherwise fallback to customer.website
              const websiteUrl = customer.url;
              return (
                <button
                  key={`row1-${index}`}
                  type="button"
                  className="flex-shrink-0 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-200 transition-all duration-300 group cursor-pointer"
                  style={{ width: '200px' }}
                  onClick={() => websiteUrl && window.open(websiteUrl, '_blank')}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && websiteUrl) {
                      window.open(websiteUrl, '_blank');
                    }
                  }}
                >
                  <div className="flex items-center justify-center h-16">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={customer.name}
                        className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Second Row - Moving Left */}
          <div className="flex gap-8 animate-scroll-left">
            {duplicatedLogos
              .slice()
              .reverse()
              .map((customer, index) => {
                const logoUrl = customer.image?.default
                  ? urlFor(customer.image.default).url()
                  : null;
                // Use customer.url (from logo doc) if present, otherwise fallback to customer.website
                const websiteUrl = customer.url;
                return (
                  <button
                    key={`row2-${index}`}
                    type="button"
                    className="flex-shrink-0 bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-200 transition-all duration-300 group cursor-pointer"
                    style={{ width: '200px' }}
                    onClick={() => websiteUrl && window.open(websiteUrl, '_blank')}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && websiteUrl) {
                        window.open(websiteUrl, '_blank');
                      }
                    }}
                  >
                    <div className="flex items-center justify-center h-16">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt={customer.name}
                          className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right:hover,
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }

        /* Faster animation on mobile */
        @media (max-width: 640px) {
          .flex-shrink-0[style] {
            width: 120px !important;
          }
          .animate-scroll-right {
            animation-duration: 20s;
          }
          .animate-scroll-left {
            animation-duration: 20s;
          }
        }
      `}</style>
    </section>
  );
};

export default CustomerShowcase;
