import { useQueryData } from '@/hooks/use-query-data-list';
import { queryRequestLogStats } from '../apis';
import type { RequestLogFilterParams, RequestLogStats } from '../config/types';

/** Headline totals and the request-volume histogram for the current filters. */
export default function useQueryRequestLogStats() {
  return useQueryData<RequestLogStats, RequestLogFilterParams>({
    key: 'requestLogStats',
    fetchDetail: queryRequestLogStats
  });
}
