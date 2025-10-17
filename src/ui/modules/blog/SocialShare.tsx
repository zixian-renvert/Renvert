'use client';

import { Facebook, Link2, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';

// X icon SVG (since Lucide does not have X yet)
const XIcon = ({ className = 'h-4 w-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    role="img"
    aria-label="X (formerly Twitter) icon"
  >
    <path d="M17.53 3H21.5l-7.19 8.21L22.5 21h-7.19l-5.66-6.47L2.47 21H.5l7.69-8.78L1.5 3h7.19l5.13 5.87L17.53 3zm-2.02 16h2.24L6.47 5h-2.2l11.24 14z" />
  </svg>
);

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  vertical?: boolean;
  image?: string;
  linkedinUrl?: string;
}

export function SocialShare({
  url,
  title,
  description,
  vertical = false,
  image, // eslint-disable-line @typescript-eslint/no-unused-vars
  linkedinUrl,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedUrl}`,
    x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=renvert`,
    linkedin: linkedinUrl || `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const buttonClass = vertical
    ? 'flex items-center justify-start w-full p-3 rounded-lg transition-colors text-left'
    : 'p-2 rounded-full transition-colors';

  const containerClass = vertical ? 'space-y-2' : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={() => handleShare('facebook')}
        className={`${buttonClass} bg-[#1877F2] hover:bg-[#166FE5] text-white`}
        aria-label="Del på Facebook"
      >
        <Facebook className={vertical ? 'h-4 w-4 mr-3' : 'h-4 w-4'} />
        {vertical && <span>Facebook</span>}
      </button>

      <button
        type="button"
        onClick={() => handleShare('x')}
        className={`${buttonClass} bg-black hover:bg-neutral-800 text-white`}
        aria-label="Del på X"
      >
        <XIcon className={vertical ? 'h-4 w-4 mr-3' : 'h-4 w-4'} />
        {vertical && <span>X</span>}
      </button>

      <button
        type="button"
        onClick={() => handleShare('linkedin')}
        className={`${buttonClass} bg-[#0A66C2] hover:bg-[#095BA8] text-white`}
        aria-label="Del på LinkedIn"
      >
        <Linkedin className={vertical ? 'h-4 w-4 mr-3' : 'h-4 w-4'} />
        {vertical && <span>LinkedIn</span>}
      </button>

      <button
        type="button"
        onClick={() => handleShare('email')}
        className={`${buttonClass} bg-gray-600 hover:bg-gray-700 text-white`}
        aria-label="Del via e-post"
      >
        <Mail className={vertical ? 'h-4 w-4 mr-3' : 'h-4 w-4'} />
        {vertical && <span>E-post</span>}
      </button>

      <button
        type="button"
        onClick={copyToClipboard}
        className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white relative`}
        aria-label="Kopier lenke"
      >
        <Link2 className={vertical ? 'h-4 w-4 mr-3' : 'h-4 w-4'} />
        {vertical && <span>{copied ? 'Kopiert!' : 'Kopier lenke'}</span>}
        {!vertical && copied && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Kopiert!
          </span>
        )}
      </button>
    </div>
  );
}
