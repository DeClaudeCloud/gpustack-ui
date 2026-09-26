import { request } from '@umijs/max';
import qs from 'query-string';
import type {
  ListItem,
  RequestLogFilterParams,
  RequestLogListParams,
  RequestLogStats
} from '../config/types';

export const REQUEST_LOGS_API = '/usage/request-logs';
export const REQUEST_LOG_STATS_API = '/usage/request-logs/stats';

// FastAPI reads a repeated key (`status=a&status=b`) as a list; axios' default
// serializer would send `status[]=a`, which it ignores.
const paramsSerializer = (params: Record<string, any>) =>
  qs.stringify(params, { skipNull: true, skipEmptyString: true });

export async function queryRequestLogs(
  params: RequestLogListParams,
  options?: { token?: any }
): Promise<Global.PageResponse<ListItem>> {
  return request(REQUEST_LOGS_API, {
    method: 'GET',
    params,
    paramsSerializer,
    cancelToken: options?.token
  });
}

export async function queryRequestLogStats(
  params: RequestLogFilterParams,
  options?: { token?: any }
): Promise<RequestLogStats> {
  return request(REQUEST_LOG_STATS_API, {
    method: 'GET',
    params,
    paramsSerializer,
    cancelToken: options?.token
  });
}
