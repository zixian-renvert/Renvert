'use client';

import { FileText, Image as ImageIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface HMSCardUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  currentFile?: File | null;
}

export default function HMSCardUpload({
  onFileSelect,
  onFileRemove,
  currentFile,
}: HMSCardUploadProps) {
  const t = useTranslations('onboarding');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileRemove = () => {
    if (onFileRemove) {
      onFileRemove();
    }
  };

  // Simple utility functions
  const isImage = (fileType: string) => fileType.startsWith('image/');
  const isPDF = (fileType: string) => fileType === 'application/pdf';
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4 p-6 border border-border rounded-lg bg-muted/30">
      <h3 className="text-xl font-semibold text-foreground">{t('step3.cleaner.hms-card.title')}</h3>
      <p className="text-muted-foreground">{t('step3.cleaner.hms-card.description')}</p>

      {!currentFile ? (
        // Upload area when no file is selected
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('step3.cleaner.hms-card.upload')}
          </label>
          <input
            type="file"
            id="hms-card-upload"
            className="hidden"
            accept="*/*"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="hms-card-upload"
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
          >
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                {t('step3.cleaner.hms-card.drag-drop')}
              </p>
            </div>
          </label>
          <p className="text-xs text-destructive">{t('step3.cleaner.hms-card.required')}</p>
          <p className="text-xs text-muted-foreground">
            {t('step3.cleaner.hms-card.more-info-text')}{' '}
            <a
              href="https://www.arbeidstilsynet.no/hms/hms-kort/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('step3.cleaner.hms-card.more-info-link')}
            </a>
          </p>
        </div>
      ) : (
        // File preview when file is uploaded
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
            <div className="flex items-center space-x-3">
              {isImage(currentFile.type) ? (
                <ImageIcon className="h-8 w-8 text-blue-600" />
              ) : isPDF(currentFile.type) ? (
                <FileText className="h-8 w-8 text-red-600" />
              ) : (
                <FileText className="h-8 w-8 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-foreground">{currentFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(currentFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFileRemove}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image preview for image files */}
          {isImage(currentFile.type) && (
            <div className="border border-border rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(currentFile)}
                alt="HMS Card Preview"
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>
          )}

          {/* PDF preview placeholder */}
          {isPDF(currentFile.type) && (
            <div className="border border-border rounded-lg p-8 text-center bg-muted/50">
              <FileText className="mx-auto h-16 w-16 text-red-600 mb-4" />
              <p className="text-sm text-muted-foreground">PDF Preview</p>
              <p className="text-xs text-muted-foreground mt-1">{currentFile.name}</p>
            </div>
          )}

          <p className="text-xs text-green-600">✓ File uploaded successfully</p>
        </div>
      )}
    </div>
  );
}
