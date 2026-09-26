import { formatLargeNumber } from '@/utils';

/** 845 ms → "845ms", 1340 ms → "1.34s", 125000 ms → "2m 5s". */
export const formatDuration = (ms?: number | null): string => {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return '-';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const formatPercent = (value?: number | null): string =>
  value === null || value === undefined ? '-' : `${value.toFixed(2)}%`;

export const formatCount = (value?: number | null): string => {
  if (value === null || value === undefined) return '-';
  return String(formatLargeNumber(value));
};

export const formatTokensPerSecond = (value?: number | null): string =>
  value === null || value === undefined ? '-' : value.toFixed(1);

export type Trend = { direction: 'up' | 'down' | 'flat'; text: string };

/** Relative change between two totals, e.g. "+12.5%". */
export const relativeTrend = (
  current?: number | null,
  previous?: number | null
): Trend | null => {
  if (current === null || current === undefined) return null;
  if (!previous) return null;
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.05) return { direction: 'flat', text: '0%' };
  return {
    direction: change > 0 ? 'up' : 'down',
    text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  };
};

/** Percentage-point change between two rates, e.g. "−2.4 pt". */
export const pointTrend = (
  current?: number | null,
  previous?: number | null
): Trend | null => {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined) return null;
  const change = current - previous;
  if (Math.abs(change) < 0.05) return { direction: 'flat', text: '0 pt' };
  return {
    direction: change > 0 ? 'up' : 'down',
    text: `${change > 0 ? '+' : ''}${change.toFixed(1)} pt`
  };
};
