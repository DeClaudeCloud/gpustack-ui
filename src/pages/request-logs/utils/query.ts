import dayjs from 'dayjs';
import { TimeRangeOptions } from '../config';
import type {
  QueryState,
  RequestLogFilterParams,
  RequestLogListParams
} from '../config/types';

/**
 * The absolute window a query state covers. A preset is re-anchored on "now"
 * every time it is resolved, which is what lets the live tail keep sliding.
 */
export const resolveWindow = (
  state: QueryState
): [dayjs.Dayjs, dayjs.Dayjs] => {
  if (state.timeRange === 'custom' && state.customRange) {
    return state.customRange;
  }
  const minutes =
    TimeRangeOptions.find((o) => o.value === state.timeRange)?.minutes ?? 60;
  const end = dayjs();
  return [end.subtract(minutes, 'minute'), end];
};

export const toFilterParams = (
  state: QueryState,
  scope: 'all' | 'self'
): RequestLogFilterParams => {
  const [start, end] = resolveWindow(state);
  return {
    scope,
    start: start.toISOString(),
    end: end.toISOString(),
    status: state.statuses.length ? state.statuses : undefined,
    stream: state.stream,
    route_id: state.routeIds.length ? state.routeIds : undefined,
    api_key_id: state.apiKeyIds.length ? state.apiKeyIds : undefined,
    user_id: state.userIds.length ? state.userIds : undefined,
    search: state.search || undefined
  };
};

// Built on already-resolved filter params so the table and the stats of one
// refresh cover exactly the same window.
export const toListParams = (
  filterParams: RequestLogFilterParams,
  state: QueryState
): RequestLogListParams => ({
  ...filterParams,
  page: state.page,
  perPage: state.perPage,
  sort_by: state.sortBy || undefined
});

/** Whether any narrowing filter (beyond the time window) is set. */
export const hasActiveFilters = (state: QueryState): boolean =>
  !!(
    state.statuses.length ||
    state.stream !== undefined ||
    state.routeIds.length ||
    state.apiKeyIds.length ||
    state.userIds.length ||
    state.search
  );
