import useCoolColors from '@/hooks/use-cool-colors';
import {
  AutoTooltip,
  StatusTag,
  TextAttribute,
  ThemeTag
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SortOrder } from 'antd/es/table/interface';
import LatencyCell from '../components/latency-cell';
import ModelCell from '../components/model-cell';
import RequestIdCell from '../components/request-id-cell';
import TimeCell from '../components/time-cell';
import TokensCell from '../components/tokens-cell';
import { RequestLogStatusLabelMap, TypeLabelMap, status } from '../config';
import type { ListItem } from '../config/types';
import { formatDuration, formatTokensPerSecond } from '../utils/format';

/** Explains a non-success outcome in the status tag's tooltip. */
export const useStatusMessage = () => {
  const intl = useIntl();
  return (record: ListItem): string | undefined => {
    if (record.status === 'error') {
      return record.status_code
        ? intl.formatMessage(
            { id: 'requestLogs.status.error.http' },
            { code: record.status_code }
          )
        : intl.formatMessage({ id: 'requestLogs.status.error.noResponse' });
    }
    if (record.status === 'incomplete') {
      return intl.formatMessage({ id: 'requestLogs.status.incomplete.hint' });
    }
    return undefined;
  };
};

const sortOrderOf = (sortBy: string | undefined, key: string): SortOrder => {
  if (sortBy === key) return 'ascend';
  if (sortBy === `-${key}`) return 'descend';
  return null;
};

export default function useRequestLogColumns(options: {
  dataList: ListItem[];
  sortBy?: string;
  showUser: boolean;
  onOpen: (record: ListItem) => void;
}): ColumnsType<ListItem> {
  const { dataList, sortBy, showUser, onOpen } = options;
  const intl = useIntl();
  const statusMessage = useStatusMessage();

  const maxDuration = Math.max(0, ...dataList.map((r) => r.duration_ms ?? 0));
  // One scale for both halves of the tokens bar.
  const maxTokenSide = Math.max(
    0,
    ...dataList.map((r) => Math.max(r.prompt_tokens, r.completion_tokens))
  );
  // The Usage page's input / output colours (its token donut), so the two
  // parts mean the same thing on both pages.
  const [inputColor, outputColor] = useCoolColors()(2);

  return [
    {
      title: intl.formatMessage({ id: 'requestLogs.table.time' }),
      key: 'created_at',
      sorter: true,
      // The default order is newest first, so an unsorted column still shows
      // the arrow it is effectively sorted by.
      sortOrder: sortBy ? sortOrderOf(sortBy, 'created_at') : 'descend',
      width: 150,
      render: (_: unknown, record: ListItem) => <TimeCell record={record} />
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.type' }),
      key: 'type',
      width: 150,
      render: (_: unknown, record: ListItem) => (
        <Flex align="center" wrap={false}>
          <ThemeTag style={{ marginInlineEnd: 0 }}>
            {intl.formatMessage({
              id: TypeLabelMap[record.type || 'unknown'] || TypeLabelMap.unknown
            })}
          </ThemeTag>
          {record.stream && (
            <TextAttribute>
              {intl.formatMessage({ id: 'requestLogs.type.stream' })}
            </TextAttribute>
          )}
        </Flex>
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.status' }),
      key: 'status',
      width: 130,
      render: (_: unknown, record: ListItem) => (
        <StatusTag
          statusValue={{
            status: status[record.status],
            text: intl.formatMessage({
              id: RequestLogStatusLabelMap[record.status]
            }),
            message: statusMessage(record)
          }}
        />
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.requestId' }),
      key: 'request_id',
      width: 190,
      render: (_: unknown, record: ListItem) => (
        <RequestIdCell record={record} onOpen={onOpen} />
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.model' }),
      key: 'model',
      width: 220,
      render: (_: unknown, record: ListItem) => <ModelCell record={record} />
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.duration' }),
      key: 'duration_ms',
      sorter: true,
      sortOrder: sortOrderOf(sortBy, 'duration_ms'),
      width: 140,
      render: (_: unknown, record: ListItem) => (
        <LatencyCell value={record.duration_ms} max={maxDuration} />
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.ttft' }),
      key: 'ttft_ms',
      sorter: true,
      sortOrder: sortOrderOf(sortBy, 'ttft_ms'),
      align: 'right' as const,
      width: 100,
      render: (_: unknown, record: ListItem) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatDuration(record.ttft_ms)}
        </span>
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.speed' }),
      key: 'tokens_per_second',
      align: 'right' as const,
      width: 90,
      render: (_: unknown, record: ListItem) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTokensPerSecond(record.tokens_per_second)}
        </span>
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.tokens' }),
      key: 'total_tokens',
      sorter: true,
      sortOrder: sortOrderOf(sortBy, 'total_tokens'),
      align: 'center' as const,
      width: 180,
      render: (_: unknown, record: ListItem) => (
        <TokensCell
          record={record}
          max={maxTokenSide}
          colors={[inputColor, outputColor]}
        />
      )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.apiKey' }),
      key: 'api_key_name',
      width: 150,
      ellipsis: { showTitle: false },
      render: (_: unknown, record: ListItem) =>
        record.api_key_name ?? (
          <span className="text-secondary">
            {intl.formatMessage({ id: 'requestLogs.apiKey.none' })}
          </span>
        )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.userAgent' }),
      key: 'user_agent',
      width: 200,
      render: (_: unknown, record: ListItem) =>
        record.user_agent ? (
          <AutoTooltip ghost style={{ maxWidth: 200 }}>
            {record.user_agent}
          </AutoTooltip>
        ) : (
          '-'
        )
    },
    {
      title: intl.formatMessage({ id: 'requestLogs.table.user' }),
      key: 'user_name',
      width: 130,
      ellipsis: true,
      hidden: !showUser,
      render: (_: unknown, record: ListItem) => record.user_name || '-'
    }
  ];
}
