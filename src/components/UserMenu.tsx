'use client';

import { cn } from '@/lib/utils';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { ChevronDown, LayoutDashboard, LogOut, MessageCircle, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../convex/_generated/api';

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className }: UserMenuProps) {
  const t = useTranslations('dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user data from Convex
  const dbUsers = useQuery(api.users.getUsers, {});
  const dbUser = dbUsers?.find((u) => u.userId === userId);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t('menu.dashboardLabel'),
      href: '/dashboard',
      description: t('menu.dashboardDesc'),
    },
    {
      icon: MessageCircle,
      label: t('menu.messagesLabel'),
      href: '/messages',
      description: t('menu.messagesDesc'),
      disabled: true, // Will be enabled in the future
      badge: t('menu.soonBadge'),
    },
    {
      icon: Settings,
      label: t('menu.accountLabel'),
      href: '/dashboard#settings',
      description: t('menu.accountDesc'),
    },
  ];

  if (!user || !dbUser) {
    return null;
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Menu Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1 rounded-full transition-all duration-200',
          'hover:shadow-md border border-gray-200 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen && 'shadow-md'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Profile Image */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Name and Chevron (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
            {user.firstName || 'User'}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {dbUser.userType && (
                  <p className="text-xs text-blue-600 font-medium capitalize">
                    {t(`profile.roles.${dbUser.userType}` as any)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <div>
                <div className="font-medium">{t('menu.signOutLabel')}</div>
                <p className="text-xs text-gray-500">{t('menu.signOutDesc')}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
