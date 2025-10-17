import { MapPin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface Job {
  title: string;
  location: string;
  applicationUrl: string;
  buttonText: string;
  reference: string;
}

interface JobOpeningsProps {
  title?: string;
  subtitle?: string;
  jobs: Job[];
}

export default function JobOpenings({
  jobs,
  title = 'Ledige stillinger',
  subtitle = 'Utforsk våre nåværende jobbmuligheter og finn din neste karrieremulighet hos Kaizen Shipping',
}: JobOpeningsProps) {
  return (
    <section id="stillinger" className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <div className="mt-3 h-1 w-24 bg-[#CF3D45] mx-auto" />
          <p className="mt-6 text-lg text-gray-600">{subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-[#CF3D45]/20 transition-all duration-300"
              >
                {/* Accent color top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CF3D45] to-[#CF3D45]/70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#CF3D45] transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1 text-[#CF3D45]/70" />
                    <span>{job.location}</span>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ref: {job.reference}</span>
                    <Link
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-white border border-[#CF3D45] px-5 py-2 text-sm font-medium text-[#CF3D45] hover:bg-[#CF3D45] hover:text-white transition-colors duration-300"
                    >
                      {job.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
