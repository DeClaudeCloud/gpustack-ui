import useUserSettings from '@/hooks/use-user-settings';
import BarChart from '@/pages/_components/bar-chart';
import { CardWrapper } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React from 'react';
import { RequestLogStatusLabelMap, StatusDotVar } from '../config';
import type { RequestLogStats, RequestLogStatus } from '../config/types';

const useStyles = createStyles(({ css, token }) => ({
  title: css`
    font-weight: 500;
    color: ${token.colorText};
  `,
  caption: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `
}));

const OUTCOMES: RequestLogStatus[] = ['success', 'error', 'incomplete'];

// ECharts paints on a canvas, which cannot resolve `var(--…)`, so the status
// dot colours are read off the document once per theme.
const readStatusColors = (): Record<RequestLogStatus, string> => {
  const style = getComputedStyle(document.documentElement);
  return OUTCOMES.reduce(
    (acc, key) => ({
      ...acc,
      [key]: style.getPropertyValue(StatusDotVar[key]).trim()
    }),
    {} as Record<RequestLogStatus, string>
  );
};

const axisFormat = (bucketSeconds: number, spanDays: number) => {
  if (bucketSeconds >= 86400) return 'MM-DD';
  if (spanDays >= 1) return 'MM-DD HH:mm';
  return 'HH:mm';
};

/** Stacked success / error / incomplete counts per time bucket. */
const VolumeChart: React.FC<{ stats?: RequestLogStats; loading: boolean }> = ({
  stats,
  loading
}) => {
  const intl = useIntl();
  const { styles } = useStyles();
  // Subscribing to the theme re-renders the chart on a switch, and the colours
  // are re-read on every render; a handful of property lookups is cheap.
  useUserSettings();
  const colors = readStatusColors();
  const buckets = stats?.buckets ?? [];
  const bucketSeconds = stats?.bucket_seconds ?? 60;
  const spanDays =
    buckets.length > 1
      ? dayjs(buckets[buckets.length - 1].time).diff(
          buckets[0].time,
          'day',
          true
        )
      : 0;
  const format = axisFormat(bucketSeconds, spanDays);

  const seriesData = OUTCOMES.map((key) => ({
    name: intl.formatMessage({ id: RequestLogStatusLabelMap[key] }),
    color: colors[key],
    stack: 'requests',
    data: buckets.map((b) => b[key])
  }));

  const bucketLabel =
    bucketSeconds >= 3600
      ? intl.formatMessage(
          { id: 'requestLogs.chart.bucketHours' },
          { count: bucketSeconds / 3600 }
        )
      : bucketSeconds >= 60
        ? intl.formatMessage(
            { id: 'requestLogs.chart.bucketMinutes' },
            { count: bucketSeconds / 60 }
          )
        : intl.formatMessage(
            { id: 'requestLogs.chart.bucketSeconds' },
            { count: bucketSeconds }
          );

  return (
    <CardWrapper style={{ padding: '12px 16px 8px' }}>
      <Flex align="baseline" gap={8} style={{ marginBottom: 4 }}>
        <span className={styles.title}>
          {intl.formatMessage({ id: 'requestLogs.chart.title' })}
        </span>
        <span className={styles.caption}>{bucketLabel}</span>
      </Flex>
      <BarChart
        loading={loading && !stats}
        height={180}
        seriesData={seriesData}
        // Full local time on the axis values (the tooltip heading shows them
        // as-is); ticks are shortened by the formatter below.
        xAxisData={buckets.map((b) => dayjs(b.time).format('YYYY-MM-DD HH:mm'))}
        labelFormatter={(v: string) => dayjs(v).format(format)}
        legendData={seriesData.map((s) => ({ name: s.name }))}
        grid={{ bottom: 28 }}
      />
    </CardWrapper>
  );
};

export default VolumeChart;
