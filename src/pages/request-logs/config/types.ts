import type dayjs from 'dayjs';

export type RequestLogStatus = 'success' | 'error' | 'incomplete';

export type TimeRangeKey =
  | '15m'
  | '1h'
  | '6h'
  | '24h'
  | '7d'
  | '30d'
  | 'custom';

/** One row of `GET /usage/request-logs`. */
export interface ListItem {
  id: number;
  request_id?: string | null;
  upstream_response_id?: string | null;
  status: RequestLogStatus;
  status_code?: number | null;
  // Operation (`chat_completion`, `embedding`, ...) when reported, else the
  // route's first category (`llm`, `embedding`, ...).
  type?: string | null;
  stream: boolean;
  // False when the token counts are server-side estimates.
  completed: boolean;
  model_name: string;
  model_route_id?: number | null;
  model_route_name?: string | null;
  provider_name?: string | null;
  cluster_name?: string | null;
  user_id?: number | null;
  user_name?: string | null;
  api_key_id?: number | null;
  api_key_name?: string | null;
  access_key?: string | null;
  user_agent?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  ttft_ms?: number | null;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  total_tokens: number;
  tokens_per_second?: number | null;
}

export interface RequestLogBucket {
  time: string;
  success: number;
  error: number;
  incomplete: number;
  avg_latency_ms?: number | null;
  tokens: number;
}

export interface RequestLogTotals {
  total_requests: number;
  success_requests: number;
  error_requests: number;
  incomplete_requests: number;
  success_rate?: number | null;
  user_success_rate?: number | null;
  avg_latency_ms?: number | null;
  p95_latency_ms?: number | null;
  avg_ttft_ms?: number | null;
  avg_tokens_per_second?: number | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** `GET /usage/request-logs/stats`. */
export interface RequestLogStats extends RequestLogTotals {
  bucket_seconds: number;
  buckets: RequestLogBucket[];
  previous?: RequestLogTotals | null;
}

/** Wire params shared by the list and stats endpoints. */
export interface RequestLogFilterParams {
  scope: 'all' | 'self';
  start: string;
  end: string;
  status?: RequestLogStatus[];
  stream?: boolean;
  route_id?: number[];
  api_key_id?: number[];
  user_id?: number[];
  search?: string;
}

export interface RequestLogListParams extends RequestLogFilterParams {
  page: number;
  perPage: number;
  sort_by?: string;
}

/** Everything the page's filters, table and live tail are driven by. */
export interface QueryState {
  timeRange: TimeRangeKey;
  customRange?: [dayjs.Dayjs, dayjs.Dayjs];
  statuses: RequestLogStatus[];
  // undefined = any, true = streamed only, false = non-streamed only
  stream?: boolean;
  routeIds: number[];
  apiKeyIds: number[];
  userIds: number[];
  search: string;
  page: number;
  perPage: number;
  sortBy?: string;
}

export interface FilterOption {
  label: string;
  value: number;
}
