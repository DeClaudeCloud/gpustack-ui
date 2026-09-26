import { StatusMaps } from '@/config';
import type { StatusType } from '@/config/types';
import type { RequestLogStatus, TimeRangeKey } from './types';

export const RequestLogStatusValueMap: Record<string, RequestLogStatus> = {
  Success: 'success',
  Error: 'error',
  Incomplete: 'incomplete'
};

export const RequestLogStatusLabelMap: Record<RequestLogStatus, string> = {
  success: 'requestLogs.status.success',
  error: 'requestLogs.status.error',
  incomplete: 'requestLogs.status.incomplete'
};

export const status: Record<RequestLogStatus, StatusType> = {
  success: StatusMaps.success,
  error: StatusMaps.error,
  incomplete: StatusMaps.warning
};

// The status dot colour of each outcome, for the volume chart. Read from the
// same CSS custom properties `StatusDot` paints with, so the chart and the
// table agree in both themes.
export const StatusDotVar: Record<RequestLogStatus, string> = {
  success: '--color-status-success-dot',
  error: '--color-status-error-dot',
  incomplete: '--color-status-warning-dot'
};

export const StatusOptions = [
  { label: 'requestLogs.status.success', value: 'success', locale: true },
  { label: 'requestLogs.status.error', value: 'error', locale: true },
  { label: 'requestLogs.status.incomplete', value: 'incomplete', locale: true }
];

export const StreamOptions = [
  { label: 'requestLogs.filter.stream.yes', value: 'stream', locale: true },
  { label: 'requestLogs.filter.stream.no', value: 'nonStream', locale: true }
];

export const TimeRangeOptions: {
  label: string;
  value: TimeRangeKey;
  minutes?: number;
  locale: true;
}[] = [
  { label: 'requestLogs.range.15m', value: '15m', minutes: 15, locale: true },
  { label: 'requestLogs.range.1h', value: '1h', minutes: 60, locale: true },
  { label: 'requestLogs.range.6h', value: '6h', minutes: 360, locale: true },
  { label: 'requestLogs.range.24h', value: '24h', minutes: 1440, locale: true },
  { label: 'requestLogs.range.7d', value: '7d', minutes: 10080, locale: true },
  {
    label: 'requestLogs.range.30d',
    value: '30d',
    minutes: 43200,
    locale: true
  },
  { label: 'requestLogs.range.custom', value: 'custom', locale: true }
];

export const DEFAULT_TIME_RANGE: TimeRangeKey = '1h';

// The widest window the custom picker allows; matches the widest preset.
export const MAX_CUSTOM_RANGE_DAYS = 30;

// Live tail refresh period. Rows reach the database on the usage flush (every
// few seconds), so polling faster than this only repeats identical reads.
export const LIVE_POLL_INTERVAL = 3000;

export const DEFAULT_PAGE_SIZE = 25;

// Operation values (reported by the direct path) and route categories (the
// fallback for gateway rows) share one label map.
export const TypeLabelMap: Record<string, string> = {
  chat_completion: 'requestLogs.type.chat',
  completion: 'requestLogs.type.completion',
  embedding: 'requestLogs.type.embedding',
  rerank: 'requestLogs.type.rerank',
  reranker: 'requestLogs.type.rerank',
  image_generation: 'requestLogs.type.image',
  image: 'requestLogs.type.image',
  audio_speech: 'requestLogs.type.tts',
  text_to_speech: 'requestLogs.type.tts',
  audio_transcription: 'requestLogs.type.stt',
  // The backend enum spells the transcription operation this way.
  audit_transcription: 'requestLogs.type.stt',
  speech_to_text: 'requestLogs.type.stt',
  llm: 'requestLogs.type.llm',
  unknown: 'requestLogs.type.unknown'
};
