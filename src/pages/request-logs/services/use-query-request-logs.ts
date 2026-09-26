import { useQueryData } from '@/hooks/use-query-data-list';
import { queryRequestLogs } from '../apis';
import type { ListItem, RequestLogListParams } from '../config/types';

/**
 * One page of the request log. A new fetch cancels the one in flight, so a
 * live-tail tick can never land a stale page over a filter change.
 */
export default function useQueryRequestLogs() {
  return useQueryData<Global.PageResponse<ListItem>, RequestLogListParams>({
    key: 'requestLogs',
    fetchDetail: queryRequestLogs
  });
}
