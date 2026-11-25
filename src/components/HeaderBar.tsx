import React, { useRef } from 'react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CloudCheck,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { formatLocalDate, formatWeekRange } from '../lib/dateUtils';
import { THEME_LIST } from '../lib/themes';
import { ThemeId, ViewMode } from '../types/todo';

export type SyncStatus = 'loading' | 'synced' | 'error';

interface HeaderBarProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToday: () => void;
  onSelectDate: (dateStr: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeTheme: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  onNewTask: () => void;
  syncStatus: SyncStatus;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotifications: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  weekStart,
  onPrevWeek,
  onNextWeek,
  onGoToday,
  onSelectDate,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  activeTheme,
  onThemeChange,
  onNewTask,
  syncStatus,
  notificationPermission,
  onRequestNotifications,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const weekRangeLabel = formatWeekRange(weekStart);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // Fallback to focus/click
      }
    }
    input.focus();
    input.click();
  };

  return (
    <header className="border-b border-[#EAE3D8] px-5 py-5 sm:px-8 sm:py-6">
      {/* Top Row: Editorial Heading + Right Controls */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        {/* Top-left: Editorial Serif Heading & Subtext */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold tracking-wider text-[#6E685F] uppercase">
              FocusList
            </span>
            <span aria-hidden="true" className="text-[#CFC7BC]">
              /
            </span>
            {/* Subtle Supabase Connection Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                syncStatus === 'error'
                  ? 'text-[#B54B3C]'
                  : syncStatus === 'loading'
                    ? 'text-[#6E685F]'
                    : 'text-[#4A6B5D]'
              }`}
            >
              {syncStatus === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {syncStatus === 'synced' && <CloudCheck className="h-3.5 w-3.5" />}
              {syncStatus === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
              <span>
                {syncStatus === 'loading'
                  ? 'Syncing...'
                  : syncStatus === 'error'
                    ? 'Sync Error'
                    : 'Supabase Synced'}
              </span>
            </span>
          </div>

          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-tight text-[#1E1B18] sm:text-[34px] text-balance">
            Weekly To-Do Dashboard
          </h1>
          <p className="mt-1 text-[13.5px] text-[#6E685F]">
            Click any priority dot to cycle urgency, check off completed items, or add tasks inline.
          </p>
        </div>

        {/* Top-right: View Switcher, Reminders Bell, 4 Theme Swatches, + New Task */}
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          {/* Segmented View Switcher */}
          <div
            role="tablist"
            aria-label="Dashboard view"
            className="inline-flex items-center rounded-xl border border-[#E5DFD5] bg-[#F5F1EB] p-1"
          >
            {(
              [
                { id: 'week', label: 'This Week' },
                { id: 'today', label: 'Today' },
                { id: 'all', label: 'All Tasks' },
              ] as const
            ).map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onViewModeChange(tab.id)}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all duration-150 ${
                    active
                      ? 'bg-white text-[#1E1B18] shadow-[0_1px_3px_rgba(30,27,24,0.08)]'
                      : 'text-[#6E685F] hover:text-[#1E1B18]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Reminders Bell Button */}
          <button
            type="button"
            onClick={onRequestNotifications}
            title={
              notificationPermission === 'granted'
                ? 'Browser reminders enabled'
                : notificationPermission === 'denied'
                  ? 'Browser notifications blocked in browser settings'
                  : 'Enable browser reminder notifications'
            }
            aria-label="Enable reminder notifications"
            className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl border px-3 text-[12.5px] font-medium transition-colors ${
              notificationPermission === 'granted'
                ? 'border-[#D4E0D8] bg-[#EDF4EF] text-[#2A4A3B]'
                : 'border-[#E5DFD5] bg-white text-[#4A443C] hover:border-[#CFC7BC] hover:bg-[#FAF7F2]'
            }`}
          >
            {notificationPermission === 'granted' ? (
              <BellRing className="h-3.5 w-3.5" />
            ) : (
              <Bell className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {notificationPermission === 'granted' ? 'Alerts On' : 'Reminders'}
            </span>
          </button>

          {/* 4 Theme Swatches */}
          <div
            role="group"
            aria-label="Column color themes"
            className="flex items-center gap-1.5 rounded-xl border border-[#E5DFD5] bg-white px-2.5 py-1.5"
          >
            {THEME_LIST.map((theme) => {
              const selected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeChange(theme.id)}
                  title={theme.name}
                  aria-label={`Select ${theme.name} theme`}
                  aria-pressed={selected}
                  className={`h-5 w-5 rounded-full transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2623] ${
                    selected ? 'scale-110 ring-2 ring-[#2B2623] ring-offset-2 ring-offset-white' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: theme.swatchColor,
                    border: `1px solid ${theme.swatchRing}`,
                  }}
                />
              );
            })}
          </div>

          {/* Primary + New Task Dark Charcoal Pill Button */}
          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full bg-[#2B2623] px-4 text-[13px] font-medium text-[#FCFBF9] shadow-sm transition-colors duration-150 hover:bg-[#1E1B18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2623] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Second Row: Week Range, < Today > Navigation + Date Picker, and Live Search Bar */}
      <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Week Range Label */}
          <span className="text-[14.5px] font-semibold tracking-tight text-[#1E1B18] tabular-nums">
            {weekRangeLabel}
          </span>

          {/* < Today > Week Navigation */}
          <div className="inline-flex items-center rounded-xl border border-[#E5DFD5] bg-white p-0.5">
            <button
              type="button"
              onClick={onPrevWeek}
              aria-label="Previous week"
              title="Previous week"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6E685F] transition-colors hover:bg-[#F5F1EB] hover:text-[#1E1B18]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onGoToday}
              className="whitespace-nowrap px-2.5 py-1 text-[12px] font-semibold text-[#1E1B18] transition-colors hover:bg-[#F5F1EB] rounded-lg"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              aria-label="Next week"
              title="Next week"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6E685F] transition-colors hover:bg-[#F5F1EB] hover:text-[#1E1B18]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={openDatePicker}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#E5DFD5] bg-white px-2.5 text-[12px] font-medium text-[#6E685F] transition-colors hover:border-[#CFC7BC] hover:text-[#1E1B18]"
              title="Jump to date"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Pick date</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={formatLocalDate(weekStart)}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              aria-label="Jump to week containing date"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8C8478]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, categories..."
            aria-label="Search tasks"
            className="h-9 w-full rounded-xl border border-[#E5DFD5] bg-white pr-8 pl-8.5 text-[13px] text-[#1E1B18] placeholder:text-[#9A9287] transition-colors focus:border-[#B9B0A4] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[#8C8478] hover:bg-[#F3EFE9] hover:text-[#1E1B18]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
