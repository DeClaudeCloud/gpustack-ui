import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Col, Flex, Row, Skeleton, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import type { RequestLogStats } from '../config/types';
import {
  formatCount,
  formatDuration,
  formatTokensPerSecond,
  pointTrend,
  relativeTrend,
  type Trend
} from '../utils/format';
import Sparkline from './sparkline';

const useStyles = createStyles(({ css, token }) => ({
  strip: css`
    border: 1px solid var(--ant-color-border);
    border-radius: var(--border-radius-lg);
    background-color: var(--ant-color-bg-container);
    overflow: hidden;
  `,
  cell: css`
    height: 100%;
    padding: 14px 16px;
    border-inline-end: 1px solid var(--ant-color-split);
    border-block-end: 1px solid var(--ant-color-split);
    /* The strip's own border closes the last cell of each row. */
    margin-inline-end: -1px;
    margin-block-end: -1px;
  `,
  label: css`
    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${token.colorTextSecondary};
    border-radius: 2px;
    &:focus-visible {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
    }
  `,
  value: css`
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${token.colorText};
  `,
  unit: css`
    margin-inline-start: 2px;
    font-size: ${token.fontSize}px;
    font-weight: 400;
    color: ${token.colorTextSecondary};
  `,
  footer: css`
    min-height: 20px;
    font-size: ${token.fontSizeSM}px;
    font-variant-numeric: tabular-nums;
    color: ${token.colorTextSecondary};
  `,
  rateTrack: css`
    flex: none;
    width: 72px;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background-color: ${token.colorFillSecondary};
  `,
  rateFill: css`
    display: block;
    height: 100%;
    border-radius: 2px;
    background-color: var(--color-status-success-dot);
  `,
  trend: css`
    white-space: nowrap;
  `,
  good: css`
    color: var(--color-status-success-text);
  `,
  bad: css`
    color: var(--color-status-error-text);
  `
}));

type Card = {
  key: string;
  label: string;
  hint: string;
  value: string;
  unit?: string;
  footer: React.ReactNode;
};

const TrendText: React.FC<{
  trend: Trend | null;
  // Whether a rising value is good news (success rate) or bad (latency).
  higherIsBetter?: boolean;
  neutral?: boolean;
  suffix: string;
}> = ({ trend, higherIsBetter = true, neutral, suffix }) => {
  const { styles, cx } = useStyles();
  if (!trend) return null;
  const good =
    trend.direction === 'flat'
      ? undefined
      : (trend.direction === 'up') === higherIsBetter;
  const className =
    neutral || good === undefined ? undefined : good ? styles.good : styles.bad;
  const Icon = trend.direction === 'down' ? ArrowDownOutlined : ArrowUpOutlined;
  return (
    <span className={cx(styles.trend, className)}>
      {trend.direction !== 'flat' && (
        <Icon style={{ fontSize: 10, marginInlineEnd: 2 }} />
      )}
      {trend.text} {suffix}
    </span>
  );
};

/**
 * The six headline numbers above the request log. Each compares against the
 * equally long window right before the selected one.
 */
const StatCards: React.FC<{ stats?: RequestLogStats; loading: boolean }> = ({
  stats,
  loading
}) => {
  const intl = useIntl();
  const { styles } = useStyles();
  const t = (id: string, values?: Record<string, any>) =>
    intl.formatMessage({ id }, values);
  const vsPrevious = t('requestLogs.stats.vsPrevious');

  const buckets = stats?.buckets ?? [];
  const previous = stats?.previous;
  const requestsSeries = buckets.map((b) => b.success + b.error + b.incomplete);
  const successSeries = buckets.map((b) => {
    const total = b.success + b.error + b.incomplete;
    return total ? (b.success / total) * 100 : null;
  });
  const latencySeries = buckets.map((b) => b.avg_latency_ms ?? null);
  const tokenSeries = buckets.map((b) => b.tokens);

  // A fixed-width graphic beside the number that states the rate; never the
  // only carrier of it, so it is hidden from assistive technology.
  const rateBar = (value?: number | null) => (
    <span className={styles.rateTrack} aria-hidden>
      <span
        className={styles.rateFill}
        style={{ width: `${Math.min(Math.max(value ?? 0, 0), 100)}%` }}
      />
    </span>
  );

  const cards: Card[] = [
    {
      key: 'requests',
      label: t('requestLogs.stats.totalRequests'),
      hint: t('requestLogs.stats.totalRequests.hint'),
      value: formatCount(stats?.total_requests ?? 0),
      footer: (
        <>
          <Sparkline
            data={requestsSeries}
            color="var(--ant-color-primary)"
            label={t('requestLogs.stats.totalRequests')}
          />
          <TrendText
            neutral
            trend={relativeTrend(
              stats?.total_requests,
              previous?.total_requests
            )}
            suffix={vsPrevious}
          />
        </>
      )
    },
    {
      key: 'success',
      label: t('requestLogs.stats.successRate'),
      hint: t('requestLogs.stats.successRate.hint'),
      value: stats?.success_rate?.toFixed(2) ?? '-',
      unit:
        stats?.success_rate !== null && stats?.success_rate !== undefined
          ? '%'
          : undefined,
      footer: (
        <>
          <Sparkline
            data={successSeries}
            color="var(--color-status-success-dot)"
            label={t('requestLogs.stats.successRate')}
          />
          <TrendText
            trend={pointTrend(stats?.success_rate, previous?.success_rate)}
            suffix={vsPrevious}
          />
        </>
      )
    },
    {
      key: 'userSuccess',
      label: t('requestLogs.stats.userSuccess'),
      hint: t('requestLogs.stats.userSuccess.hint'),
      value: stats?.user_success_rate?.toFixed(2) ?? '-',
      unit:
        stats?.user_success_rate !== null &&
        stats?.user_success_rate !== undefined
          ? '%'
          : undefined,
      footer: (
        <>
          {rateBar(stats?.user_success_rate)}
          <TrendText
            trend={pointTrend(
              stats?.user_success_rate,
              previous?.user_success_rate
            )}
            suffix={vsPrevious}
          />
        </>
      )
    },
    {
      key: 'latency',
      label: t('requestLogs.stats.avgLatency'),
      hint: t('requestLogs.stats.avgLatency.hint'),
      value: formatDuration(stats?.avg_latency_ms),
      footer: (
        <>
          <Sparkline
            data={latencySeries}
            color="var(--color-status-warning-dot)"
            label={t('requestLogs.stats.avgLatency')}
          />
          <span>
            {t('requestLogs.stats.p95', {
              value: formatDuration(stats?.p95_latency_ms)
            })}
          </span>
        </>
      )
    },
    {
      key: 'speed',
      label: t('requestLogs.stats.speed'),
      hint: t('requestLogs.stats.speed.hint'),
      value: formatTokensPerSecond(stats?.avg_tokens_per_second),
      unit:
        stats?.avg_tokens_per_second !== null &&
        stats?.avg_tokens_per_second !== undefined
          ? t('requestLogs.unit.tokensPerSecond')
          : undefined,
      footer: (
        <span>
          {t('requestLogs.stats.ttft', {
            value: formatDuration(stats?.avg_ttft_ms)
          })}
        </span>
      )
    },
    {
      key: 'tokens',
      label: t('requestLogs.stats.totalTokens'),
      hint: t('requestLogs.stats.totalTokens.hint'),
      value: formatCount(stats?.total_tokens ?? 0),
      footer: (
        <>
          <Sparkline
            data={tokenSeries}
            color="var(--ant-color-primary)"
            label={t('requestLogs.stats.totalTokens')}
          />
          <span>
            {formatCount(stats?.prompt_tokens ?? 0)} /{' '}
            {formatCount(stats?.completion_tokens ?? 0)}
          </span>
        </>
      )
    }
  ];

  return (
    <div className={styles.strip}>
      <Row>
        {cards.map((card) => (
          <Col key={card.key} xs={12} md={8} xxl={4}>
            <Flex vertical gap={6} className={styles.cell}>
              <Tooltip
                title={card.hint}
                placement="topLeft"
                trigger={['hover', 'focus']}
              >
                {/* Focusable so the explanation is reachable from the keyboard. */}
                <span className={styles.label} tabIndex={0}>
                  {card.label}
                </span>
              </Tooltip>
              {loading && !stats ? (
                <Skeleton.Input active size="small" style={{ height: 32 }} />
              ) : (
                <span className={styles.value}>
                  {card.value}
                  {card.unit && (
                    <span className={styles.unit}>{card.unit}</span>
                  )}
                </span>
              )}
              <Flex align="center" gap={8} wrap className={styles.footer}>
                {card.footer}
              </Flex>
            </Flex>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StatCards;
