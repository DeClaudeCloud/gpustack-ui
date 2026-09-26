import {
  CopyButton,
  StatusTag,
  TextAttribute,
  ThemeTag
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Descriptions, Drawer, Flex, type DescriptionsProps } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React from 'react';
import { RequestLogStatusLabelMap, TypeLabelMap, status } from '../config';
import type { ListItem } from '../config/types';
import { useStatusMessage } from '../hooks/use-request-log-columns';
import { formatDuration, formatTokensPerSecond } from '../utils/format';

const useStyles = createStyles(({ css, token }) => ({
  section: css`
    margin-top: 20px;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${token.colorText};
  `,
  mono: css`
    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    word-break: break-all;
  `
}));

const timestamp = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss.SSS') : '-';

const LogDetailDrawer: React.FC<{
  record: ListItem | null;
  onClose: () => void;
}> = ({ record, onClose }) => {
  const intl = useIntl();
  const { styles } = useStyles();
  const statusMessage = useStatusMessage();
  const t = (id: string, values?: Record<string, any>) =>
    intl.formatMessage({ id }, values);

  const copyable = (value?: string | null) =>
    value ? (
      <Flex align="center" gap={4}>
        <span className={styles.mono}>{value}</span>
        <CopyButton text={value} size="small" />
      </Flex>
    ) : (
      '-'
    );

  const section = (
    title: string,
    items: DescriptionsProps['items']
  ): React.ReactNode => (
    <>
      <div className={styles.section}>{title}</div>
      <Descriptions
        bordered
        size="small"
        column={1}
        items={items}
        styles={{ label: { width: 170 } }}
      />
    </>
  );

  return (
    <Drawer
      open={!!record}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={t('requestLogs.detail.title')}
    >
      {record && (
        <>
          <Flex align="center" gap={8} wrap>
            <StatusTag
              statusValue={{
                status: status[record.status],
                text: t(RequestLogStatusLabelMap[record.status]),
                message: statusMessage(record)
              }}
            />
            <ThemeTag>
              {t(
                TypeLabelMap[record.type || 'unknown'] || TypeLabelMap.unknown
              )}
            </ThemeTag>
            {record.stream && (
              <TextAttribute>{t('requestLogs.type.stream')}</TextAttribute>
            )}
            {statusMessage(record) && (
              <span className="text-secondary">{statusMessage(record)}</span>
            )}
          </Flex>

          {section(t('requestLogs.detail.identifiers'), [
            {
              key: 'response',
              label: t('requestLogs.detail.responseId'),
              children: copyable(record.upstream_response_id)
            },
            {
              key: 'request',
              label: t('requestLogs.detail.requestId'),
              children: copyable(record.request_id)
            },
            {
              key: 'code',
              label: t('requestLogs.detail.statusCode'),
              children:
                record.status_code ?? t('requestLogs.detail.notReported')
            }
          ])}

          {section(t('requestLogs.detail.timing'), [
            {
              key: 'started',
              label: t('requestLogs.detail.startedAt'),
              children: timestamp(record.started_at)
            },
            {
              key: 'completed',
              label: t('requestLogs.detail.completedAt'),
              children: timestamp(record.completed_at)
            },
            {
              key: 'duration',
              label: t('requestLogs.table.duration'),
              children: formatDuration(record.duration_ms)
            },
            {
              key: 'ttft',
              label: t('requestLogs.table.ttft'),
              children: formatDuration(record.ttft_ms)
            },
            {
              key: 'speed',
              label: t('requestLogs.detail.speed'),
              children:
                record.tokens_per_second === null ||
                record.tokens_per_second === undefined
                  ? '-'
                  : `${formatTokensPerSecond(record.tokens_per_second)} ${t('requestLogs.unit.tokensPerSecond')}`
            }
          ])}

          {section(t('requestLogs.detail.tokens'), [
            {
              key: 'prompt',
              label: t('requestLogs.detail.promptTokens'),
              children: record.prompt_tokens.toLocaleString()
            },
            {
              key: 'cached',
              label: t('requestLogs.detail.cachedTokens'),
              children: record.cached_tokens.toLocaleString()
            },
            {
              key: 'completion',
              label: t('requestLogs.detail.completionTokens'),
              children: record.completion_tokens.toLocaleString()
            },
            {
              key: 'total',
              label: t('requestLogs.detail.totalTokens'),
              children: (
                <span>
                  {record.total_tokens.toLocaleString()}
                  {!record.completed && (
                    <TextAttribute>
                      {t('requestLogs.tokens.estimatedShort')}
                    </TextAttribute>
                  )}
                </span>
              )
            }
          ])}

          {section(t('requestLogs.detail.routing'), [
            {
              key: 'route',
              label: t('requestLogs.detail.route'),
              children: record.model_route_name || '-'
            },
            {
              key: 'model',
              label: t('requestLogs.detail.model'),
              children: record.model_name
            },
            {
              key: 'provider',
              label: t('requestLogs.detail.provider'),
              children: record.provider_name || '-'
            },
            {
              key: 'cluster',
              label: t('requestLogs.detail.cluster'),
              children: record.cluster_name || '-'
            }
          ])}

          {section(t('requestLogs.detail.caller'), [
            {
              key: 'user',
              label: t('requestLogs.table.user'),
              children: record.user_name || '-'
            },
            {
              key: 'key',
              label: t('requestLogs.table.apiKey'),
              children: record.api_key_name || t('requestLogs.apiKey.none')
            },
            {
              key: 'userAgent',
              label: t('requestLogs.table.userAgent'),
              children: record.user_agent ? (
                <span className={styles.mono}>{record.user_agent}</span>
              ) : (
                '-'
              )
            },
            {
              key: 'access',
              label: t('requestLogs.detail.accessKey'),
              children: record.access_key ? (
                <span className={styles.mono}>{record.access_key}</span>
              ) : (
                '-'
              )
            }
          ])}
        </>
      )}
    </Drawer>
  );
};

export default LogDetailDrawer;
