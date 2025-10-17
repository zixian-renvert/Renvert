'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface DateTimeSelectorProps {
  selectedDate: string;
  selectedTimeRange: string;
  onDateChange: (date: string) => void;
  onTimeRangeChange: (timeRange: string) => void;
  className?: string;
}

export default function DateTimeSelector({
  selectedDate,
  selectedTimeRange,
  onDateChange,
  onTimeRangeChange,
  className,
}: DateTimeSelectorProps) {
  const t = useTranslations('booking');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const timeRanges = [
    { id: '08:00-12:00', label: t('timeRanges.morning'), time: '08:00 - 12:00' },
    { id: '12:00-16:00', label: t('timeRanges.afternoon'), time: '12:00 - 16:00' },
    { id: '16:00-20:00', label: t('timeRanges.evening'), time: '16:00 - 20:00' },
    { id: 'flexible', label: t('timeRanges.flexible'), time: t('timeRanges.flexibleDesc') },
  ];

  const selectedDateObj = selectedDate
    ? (() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      })()
    : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const _minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow (unused)

  const now = new Date();

  const isSameLocalDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const isDateDisabled = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);

    // Disable strictly past days
    if (d < t) return true;

    // If today, disable if all slots have effectively passed (after 20:00)
    if (d.getTime() === t.getTime()) {
      const lastSlotEnd = new Date();
      lastSlotEnd.setHours(20, 0, 0, 0);
      if (now >= lastSlotEnd) return true;
    }

    return false;
  };

  const isTimeRangeDisabled = (rangeId: string) => {
    if (!selectedDateObj) return false;
    // Only enforce time cutoffs for same-day selections
    if (!isSameLocalDay(selectedDateObj, now)) return false;

    if (rangeId === 'flexible') {
      // Allow flexible until the last slot start (20:00 interpreted as end of availability)
      const cutoff = new Date(now);
      cutoff.setHours(20, 0, 0, 0);
      return now >= cutoff;
    }

    // Parse start time from id format "HH:MM-HH:MM"
    const startStr = rangeId.split('-')[0];
    const [startHour, startMinute] = startStr.split(':').map(Number);
    const startTime = new Date(selectedDateObj);
    startTime.setHours(startHour, startMinute, 0, 0);

    // Disable if slot has started already
    return now >= startTime;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Use local timezone to avoid UTC conversion issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      onDateChange(localDateString);
      setIsCalendarOpen(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return t('dateTime.selectDate');
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t('dateTime.date')}</label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {formatDisplayDate(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Range Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t('dateTime.timeRange')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {timeRanges.map((range) => (
            <Card
              key={range.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-sm',
                isTimeRangeDisabled(range.id) && 'opacity-50 pointer-events-none cursor-not-allowed',
                selectedTimeRange === range.id && !isTimeRangeDisabled(range.id)
                  ? 'ring-2 ring-muted-foreground bg-muted border-muted-foreground'
                  : 'hover:border-muted-foreground/30'
              )}
              onClick={() => {
                if (!isTimeRangeDisabled(range.id)) {
                  onTimeRangeChange(range.id);
                }
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Clock
                    className={cn(
                      'h-3 w-3',
                      selectedTimeRange === range.id ? 'text-muted-foreground' : 'text-muted-foreground'
                    )}
                  />
                  <div>
                    <div className="text-sm font-medium">{range.label}</div>
                    <div className="text-xs text-muted-foreground">{range.time}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
