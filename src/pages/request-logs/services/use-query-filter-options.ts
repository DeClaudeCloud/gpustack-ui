import { useQueryData } from '@/hooks/use-query-data-list';
import { queryUsageMetaData } from '@/pages/usage/apis';
import type { UsageFilterItem, UsageMeta } from '@/pages/usage/config/types';
import type { FilterOption } from '../config/types';

type IdKey = 'route_id' | 'api_key_id' | 'user_id';

// Only entities that still exist can be filtered by id; a deleted route or key
// has no `current` id left to match on.
const toOptions = (
  items: UsageFilterItem[] | undefined,
  idKey: IdKey,
  getLabel: (item: UsageFilterItem) => string | null | undefined
): FilterOption[] =>
  (items || []).flatMap((item: UsageFilterItem & { label?: string }) => {
    const id = item.identity?.current?.[idKey];
    if (id === null || id === undefined) return [];
    return [
      { value: Number(id), label: getLabel(item) || item.label || `#${id}` }
    ];
  });

/**
 * Model / API key / user filter options, from the same `/usage/meta` the Usage
 * page uses. Both read the per-request usage the gateway reports, so any
 * option offered here matches rows in the log.
 */
export default function useQueryFilterOptions() {
  const { detailData, fetchData } = useQueryData<UsageMeta, { scope: string }>({
    key: 'requestLogFilterOptions',
    fetchDetail: queryUsageMetaData
  });

  const filters = detailData?.filters;
  return {
    fetchData,
    routeOptions: toOptions(
      filters?.routes,
      'route_id',
      (i) => i.identity.value.route_name
    ),
    apiKeyOptions: toOptions(
      filters?.api_keys,
      'api_key_id',
      (i) => i.identity.value.api_key_name
    ),
    userOptions: toOptions(
      filters?.users,
      'user_id',
      (i) => i.identity.value.user_name
    )
  };
}
