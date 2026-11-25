import { TodoPayload } from '../types/todo';

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return next;
}

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatShortMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${weekStart.getDate()}, ${startYear} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
  }
  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${endYear}`;
  }
  return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
}

export function normalizeTimeHHMM(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return '';
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string | null | undefined): string | null {
  const hhmm = normalizeTimeHHMM(timeStr);
  if (!hhmm) return null;
  const [hRaw, mRaw] = hhmm.split(':').map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return null;
  const period = hRaw >= 12 ? 'PM' : 'AM';
  const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
  return `${h12}:${String(mRaw).padStart(2, '0')} ${period}`;
}

export function getTimeMinutes(timeStr: string | null | undefined): number | null {
  const hhmm = normalizeTimeHHMM(timeStr);
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function addMinutesToSchedule(
  dateStr: string | null,
  timeStr: string | null,
  minutesToAdd: number
): { due_date: string; due_time: string } {
  const now = new Date();
  const baseDate = dateStr ? parseLocalDate(dateStr) : now;
  const hhmm = normalizeTimeHHMM(timeStr);
  let hours = now.getHours();
  let mins = now.getMinutes();

  if (hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    hours = h;
    mins = m;
  }

  // Always snooze from at least current time if the scheduled time is already in the past
  const scheduled = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    mins
  );
  const reference = scheduled.getTime() < now.getTime() ? now : scheduled;
  const target = new Date(reference.getTime() + minutesToAdd * 60_000);

  return {
    due_date: formatLocalDate(target),
    due_time: `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`,
  };
}

export function getSampleWeekTodos(weekStart: Date): TodoPayload[] {
  const d = (offset: number) => formatLocalDate(addDays(weekStart, offset));
  return [
    {
      title: 'Review Q4 design roadmap',
      description: 'Audit sprint milestones and finalize editorial layout priorities with design leads.',
      priority: 'High',
      category: 'Work',
      due_date: d(0),
      due_time: '09:30',
      completed: true,
      reminded: true,
    },
    {
      title: 'Order fresh pour-over beans',
      description: 'Ethiopian washed roast from local roastery.',
      priority: 'Low',
      category: 'Personal',
      due_date: d(0),
      due_time: '17:00',
      completed: false,
      reminded: false,
    },
    {
      title: 'Draft architecture memo',
      description: 'Outline Postgres indexing strategy and client caching notes.',
      priority: 'High',
      category: 'Projects',
      due_date: d(1),
      due_time: '10:00',
      completed: false,
      reminded: false,
    },
    {
      title: 'Read typography chapter 4',
      description: 'Focus on optical sizing and editorial serif pairings.',
      priority: 'Medium',
      category: 'Study',
      due_date: d(1),
      due_time: '19:30',
      completed: false,
      reminded: false,
    },
    {
      title: 'Weekly sync with product team',
      description: 'Walk through user feedback and prioritize next release polish.',
      priority: 'Medium',
      category: 'Work',
      due_date: d(2),
      due_time: '11:00',
      completed: true,
      reminded: true,
    },
    {
      title: 'Evening pilates session',
      description: '45-minute reformer class downtown.',
      priority: 'Low',
      category: 'Personal',
      due_date: d(2),
      due_time: '18:15',
      completed: false,
      reminded: false,
    },
    {
      title: 'Prototype interactive calendar card',
      description: 'Refine micro-interactions and keyboard focus states.',
      priority: 'High',
      category: 'Projects',
      due_date: d(3),
      due_time: '14:00',
      completed: false,
      reminded: false,
    },
    {
      title: 'Practice Spanish flashcards',
      description: '30-minute spaced repetition deck.',
      priority: 'Low',
      category: 'Study',
      due_date: d(3),
      due_time: '20:00',
      completed: false,
      reminded: false,
    },
    {
      title: 'Send client invoice & wrap-up',
      description: 'Attach deliverable summary and schedule next check-in.',
      priority: 'Medium',
      category: 'Work',
      due_date: d(4),
      due_time: '15:30',
      completed: false,
      reminded: false,
    },
    {
      title: 'Farmers market morning stroll',
      description: 'Pick up seasonal greens, sourdough, and fresh eucalyptus.',
      priority: 'Low',
      category: 'Personal',
      due_date: d(5),
      due_time: '09:30',
      completed: false,
      reminded: false,
    },
    {
      title: 'Plan upcoming week priorities',
      description: 'Clear inbox, review Sunday evening checklist, and set Monday focus.',
      priority: 'Medium',
      category: 'Personal',
      due_date: d(6),
      due_time: '18:00',
      completed: false,
      reminded: false,
    },
  ];
}
