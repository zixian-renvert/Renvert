'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Globe } from 'lucide-react';
import type { Locale } from 'next-intl';
import { useParams } from 'next/navigation';
import { type ReactNode, useTransition } from 'react';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
  className?: string;
  variant?: 'default' | 'ghost';
};

interface LocaleOption {
  value: string;
  label: string;
}

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
  className,
  variant = 'ghost',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  // Extract options from children
  const options: LocaleOption[] = [];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child?.props?.value && child?.props?.children) {
        options.push({
          value: child.props.value,
          label: child.props.children,
        });
      }
    }
  }

  const currentOption = options.find((option) => option.value === defaultValue);

  function onSelectLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale as Locale }
      );
    });
  }

  // Get display text for current locale (extract just the country code)
  const getCurrentDisplay = () => {
    if (!currentOption) return '';

    // Extract flag and country code from the full label (e.g., "🇳🇴 Norsk" -> "NO")
    const label = currentOption.label;
    if (label.includes('Norsk')) return 'NO';
    if (label.includes('English')) return 'EN';

    // Fallback to uppercase locale code
    return defaultValue.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          aria-label={label}
          className={cn('h-8 px-2 gap-1.5', isPending && 'opacity-50', className)}
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{getCurrentDisplay()}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((option) => {
          const isSelected = option.value === defaultValue;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSelectLocale(option.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="flex-1">{option.label}</span>
              {isSelected && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
