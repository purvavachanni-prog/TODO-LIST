import { Priority, ThemeId } from '../types/todo';

export interface DayColumnPalette {
  bg: string;
  text: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}

export interface DashboardTheme {
  id: ThemeId;
  name: string;
  swatchColor: string;
  swatchRing: string;
  days: DayColumnPalette[]; // 0 = Monday ... 6 = Sunday
}

export const DASHBOARD_THEMES: Record<ThemeId, DashboardTheme> = {
  'warm-editorial': {
    id: 'warm-editorial',
    name: 'Warm Editorial',
    swatchColor: '#EAD4D1',
    swatchRing: '#C89E98',
    days: [
      { bg: '#EAD4D1', text: '#4A2E2B', accent: '#B97E77', badgeBg: '#4A2E2B', badgeText: '#FCFBF9' }, // Monday - Dusty Rosewater
      { bg: '#EFE0CE', text: '#4E3924', accent: '#C49868', badgeBg: '#4E3924', badgeText: '#FCFBF9' }, // Tuesday - Muted Apricot Sand
      { bg: '#D7E4DC', text: '#263D31', accent: '#68937A', badgeBg: '#263D31', badgeText: '#FCFBF9' }, // Wednesday - Soft Eucalyptus Sage
      { bg: '#D9E1EC', text: '#28374B', accent: '#6D88AD', badgeBg: '#28374B', badgeText: '#FCFBF9' }, // Thursday - Dusty Periwinkle Mist
      { bg: '#E4DCEB', text: '#3B2E4A', accent: '#8E75A8', badgeBg: '#3B2E4A', badgeText: '#FCFBF9' }, // Friday - Soft Lavender Clay
      { bg: '#EAE4D8', text: '#3F382E', accent: '#9A8C73', badgeBg: '#3F382E', badgeText: '#FCFBF9' }, // Saturday - Warm Oatmeal
      { bg: '#EFE2DF', text: '#4D322E', accent: '#B8847B', badgeBg: '#4D322E', badgeText: '#FCFBF9' }, // Sunday - Blush Cream
    ],
  },
  'botanical-sage': {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    swatchColor: '#D7E4DC',
    swatchRing: '#79A089',
    days: [
      { bg: '#D7E4DC', text: '#263D31', accent: '#628F75', badgeBg: '#263D31', badgeText: '#FCFBF9' },
      { bg: '#E3EAD9', text: '#2E3B25', accent: '#7B9462', badgeBg: '#2E3B25', badgeText: '#FCFBF9' },
      { bg: '#DCE6E2', text: '#243C38', accent: '#5D8E86', badgeBg: '#243C38', badgeText: '#FCFBF9' },
      { bg: '#EBE6D8', text: '#3D3728', accent: '#9A8F6B', badgeBg: '#3D3728', badgeText: '#FCFBF9' },
      { bg: '#D4E0DA', text: '#223A30', accent: '#5B8872', badgeBg: '#223A30', badgeText: '#FCFBF9' },
      { bg: '#E7E4DC', text: '#39362E', accent: '#8D8776', badgeBg: '#39362E', badgeText: '#FCFBF9' },
      { bg: '#E2E9E1', text: '#2A3B2B', accent: '#6F8E6E', badgeBg: '#2A3B2B', badgeText: '#FCFBF9' },
    ],
  },
  'dusk-lavender': {
    id: 'dusk-lavender',
    name: 'Dusk Lavender',
    swatchColor: '#E4DCEB',
    swatchRing: '#9A83B2',
    days: [
      { bg: '#E4DCEB', text: '#3B2E4A', accent: '#8B71A8', badgeBg: '#3B2E4A', badgeText: '#FCFBF9' },
      { bg: '#D9E1EC', text: '#28374B', accent: '#6C87AB', badgeBg: '#28374B', badgeText: '#FCFBF9' },
      { bg: '#EADBE4', text: '#472E3D', accent: '#A67591', badgeBg: '#472E3D', badgeText: '#FCFBF9' },
      { bg: '#DFE2F0', text: '#2D324D', accent: '#7680B3', badgeBg: '#2D324D', badgeText: '#FCFBF9' },
      { bg: '#E6DFEA', text: '#3E3047', accent: '#9279A3', badgeBg: '#3E3047', badgeText: '#FCFBF9' },
      { bg: '#E3E0E6', text: '#38343E', accent: '#878091', badgeBg: '#38343E', badgeText: '#FCFBF9' },
      { bg: '#ECE0E6', text: '#49313D', accent: '#A87B90', badgeBg: '#49313D', badgeText: '#FCFBF9' },
    ],
  },
  'minimalist-mono': {
    id: 'minimalist-mono',
    name: 'Minimalist Mono',
    swatchColor: '#E8E4DE',
    swatchRing: '#8C847A',
    days: [
      { bg: '#EDEAE4', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#E6E2DC', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#EFECE7', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#E8E5DF', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#EBE8E2', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#E4E0D9', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
      { bg: '#EDEAE5', text: '#1E1B18', accent: '#5A554E', badgeBg: '#1E1B18', badgeText: '#FCFBF9' },
    ],
  },
};

export const THEME_LIST: DashboardTheme[] = [
  DASHBOARD_THEMES['warm-editorial'],
  DASHBOARD_THEMES['botanical-sage'],
  DASHBOARD_THEMES['dusk-lavender'],
  DASHBOARD_THEMES['minimalist-mono'],
];

export const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    dotColor: string;
    ringColor: string;
    next: Priority;
  }
> = {
  Low: {
    label: 'Low',
    dotColor: '#5E8B7E', // Sage
    ringColor: 'rgba(94, 139, 126, 0.25)',
    next: 'Medium',
  },
  Medium: {
    label: 'Medium',
    dotColor: '#D99B26', // Amber
    ringColor: 'rgba(217, 155, 38, 0.25)',
    next: 'High',
  },
  High: {
    label: 'High',
    dotColor: '#C86D5B', // Terracotta Rose
    ringColor: 'rgba(200, 109, 91, 0.25)',
    next: 'Low',
  },
};

export const CATEGORIES = ['Work', 'Study', 'Personal', 'Projects'] as const;
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
