'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlFor } from '@/sanity/lib/image';
import { contactSubmission } from '@/ui/actions/contactSubmission';
import { CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

export interface ContactFormProps {
  title: string;
  description: string;
  serviceTypes: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    openingHours: string[];
  };
  image?: any;
  privacyText: string;
  buttonText: string;
}

export default function ContactForm(props: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;
    setLoading(true);
    const _response = await contactSubmission({
      email: formData.email,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      message: formData.message,
    });
    setLoading(false);
    setSubmitted(true);
  };
  const t = useTranslations('contact-form');

  return (
    <section id="kontakt" className="bg-white py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {props.title}
          </h2>
          <div className="mt-3 h-1 w-24 bg-[#CF3D45] mx-auto" />
          <p className="mt-6 text-lg text-gray-600">{props.description}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {!submitted ? (
            <>
              <div className="rounded-lg bg-gray-50 p-8 shadow-lg border border-gray-100">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">{t('send-message')}</h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-900"
                      >
                        {t('name')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder={t('your-name')}
                        className="w-full border-gray-300 focus:border-[#CF3D45] focus:ring-[#CF3D45] bg-white"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-900"
                      >
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('your-email')}
                        className="w-full border-gray-300 focus:border-[#CF3D45] focus:ring-[#CF3D45] bg-white"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-gray-900"
                      >
                        {t('phone')}
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t('your-phone')}
                        className="w-full border-gray-300 focus:border-[#CF3D45] focus:ring-[#CF3D45] bg-white"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-medium text-gray-900"
                      >
                        {t('company')}
                      </label>
                      <Input
                        id="company"
                        name="company"
                        placeholder={t('your-company')}
                        className="w-full border-gray-300 focus:border-[#CF3D45] focus:ring-[#CF3D45] bg-white"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      {t('message')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder={t('your-message')}
                      className="min-h-[150px] w-full border-gray-300 focus:border-[#CF3D45] focus:ring-[#CF3D45] rounded-md p-2 bg-white"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="contact-privacy"
                        type="checkbox"
                        className="h-4 w-4 text-[#CF3D45] border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="contact-privacy" className="text-gray-600">
                        {props.privacyText}
                      </label>
                      <span className="text-red-500 ">*</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#CF3D45] hover:bg-[#b83740] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Sender...' : props.buttonText || 'Send melding'}
                  </Button>
                </form>
              </div>
              <div className="rounded-lg bg-white p-0 shadow-lg overflow-hidden border border-gray-100">
                <div className="relative h-48 overflow-hidden">
                  {props.image && (
                    <Image
                      src={urlFor(props.image).url()}
                      alt={props.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-8">
                  <h3 className="mb-6 text-2xl font-bold text-gray-900">
                    {t('contact-information')}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <Phone className="mr-4 h-6 w-6 text-[#CF3D45]" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('phone')}
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {t('open-24-7')}
                          </span>
                        </h4>
                        <p className="mt-1 text-gray-600">{props.contactInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-4 h-6 w-6 text-[#CF3D45]" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t('email')}</h4>
                        <p className="mt-1 text-gray-600">{props.contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="mr-4 h-6 w-6 text-[#CF3D45]" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t('address')}</h4>
                        <p className="mt-1 text-gray-600">{props.contactInfo.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="mb-4 text-sm font-medium text-gray-900">{t('opening-hours')}</h4>
                    <div className="space-y-2 text-gray-600">
                      {props.contactInfo.openingHours?.map((hours, idx) => (
                        <div className="flex justify-between" key={idx}>
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-center min-h-[400px]">
              <div className="bg-green-50 p-8 rounded-xl text-center w-full max-w-lg mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('thank-you')}</h3>
                <p className="text-gray-600 text-lg mb-6">{t('we-have-received-your-message')}</p>
                <p className="text-gray-500 mb-6">{t('check-your-email')}</p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  {t('send-new-message')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
