'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlFor } from '@/sanity/lib/image';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import { newsletterSubmission } from '../actions/newsletterSubmission';

interface ContactSectionProps {
  title?: string;
  description?: string;
  image?: any;
  features?: string[];
  privacyText?: string;
  buttonText?: string;
  _key?: string;
}

const Newsletter: React.FC<ContactSectionProps> = ({
  title,
  description,
  image,
  features = [],
  privacyText,
  buttonText = 'Send',
  _key,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !privacy || !name || !company) return;
    setLoading(true);
    const _response = await newsletterSubmission({
      email,
      name,
      company: company,
    });
    setSubmitted(true);
    setLoading(false);
  };
  const t = useTranslations('contact-form');

  return (
    <section
      id="nyhetsbrev"
      className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      key={_key}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Left side with image and overlay */}
              <div className="md:col-span-2 relative min-h-[320px]">
                <div className="absolute inset-0 bg-[#CF3D45]/90 mix-blend-multiply z-10" />
                {image && (
                  <Image
                    src={urlFor(image).url()}
                    alt={title || 'Contact'}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="relative z-20 p-8 md:p-10 h-full flex flex-col justify-center text-white">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-6">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
                  {description && <p className="text-white/90 text-lg mb-6">{description}</p>}
                  {features && features.length > 0 && (
                    <ul className="space-y-3">
                      {features.map((feature, i) => (
                        <li className="flex items-center" key={i}>
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right side with form */}
              <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                {!submitted ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('newsletter')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {t('name')} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="contact-name"
                            type="text"
                            placeholder={t('your-name')}
                            className="w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {t('email')}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder={t('your-email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-company"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t('company')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="contact-company"
                          type="text"
                          placeholder={t('your-company')}
                          className="w-full"
                          value={company}
                          required
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="newsletter-privacy"
                            type="checkbox"
                            className="h-4 w-4 text-[#CF3D45] border-gray-300 rounded"
                            checked={privacy}
                            onChange={(e) => setPrivacy(e.target.checked)}
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="newsletter-privacy" className="text-gray-600">
                            {privacyText || (
                              <>
                                {t('privacy-text')}{' '}
                                <a href="/legal/privacy" className="text-[#CF3D45] hover:underline">
                                  {t('privacy-link')}
                                </a>
                                .
                              </>
                            )}
                            <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#CF3D45] hover:bg-[#b83740] text-white py-6 text-lg flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        {loading ? 'Sender...' : buttonText}
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="bg-green-50 p-8 rounded-xl text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('thank-you')}</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      {t('we-have-received-your-message')}
                    </p>
                    <p className="text-gray-500">{t('check-your-email')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
