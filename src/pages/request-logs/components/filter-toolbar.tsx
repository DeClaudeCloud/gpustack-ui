import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { SimpleSelect } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button, DatePicker, Flex, Input, Select, Tooltip } from 'antd';
import { createStyles, keyframes } from 'antd-style';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useMemo } from 'react';
import {
  MAX_CUSTOM_RANGE_DAYS,
  StatusOptions,
  StreamOptions,
  TimeRangeOptions
} from '../config';
import type {
  FilterOption,
  QueryState,
  RequestLogStatus,
  TimeRangeKey
} from '../config/types';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--live-dot-ring); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

const useStyles = createStyles(({ css, token }) => ({
  liveDot: css`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${token.colorTextQuaternary};
  `,
  liveDotOn: css`
    --live-dot-ring: var(--color-status-success-dot);
    background-color: var(--color-status-success-dot);
    animation: ${pulse} 1.6s ease-out infinite;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `
}));

interface FilterToolbarProps {
  value: QueryState;
  routeOptions: FilterOption[];
  apiKeyOptions: FilterOption[];
  userOptions: FilterOption[];
  showUserFilter: boolean;
  live: boolean;
  refreshing: boolean;
  onChange: (patch: Partial<QueryState>) => void;
  onToggleLive: () => void;
  onRefresh: () => void;
}

const selectStyles = (width: number) => ({
  wrapper: { flex: 'unset', width }
});

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  value,
  routeOptions,
  apiKeyOptions,
  userOptions,
  showUserFilter,
  live,
  refreshing,
  onChange,
  onToggleLive,
  onRefresh
}) => {
  const intl = useIntl();
  const { styles, cx } = useStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const localize = <T,>(options: { label: string; value: T }[]) =>
    options.map((o) => ({ ...o, label: t(o.label) }));

  // Stable across renders so a keystroke doesn't reset the pending debounce.
  const onSearch = useMemo(
    () =>
      _.debounce(
        (text: string) => onChange({ search: text.trim(), page: 1 }),
        400
      ),
    [onChange]
  );

  const streamValue =
    value.stream === undefined
      ? undefined
      : value.stream
        ? 'stream'
        : 'nonStream';

  const disabledDate = (current: dayjs.Dayjs) =>
    current.isAfter(dayjs().endOf('day')) ||
    current.isBefore(
      dayjs().subtract(MAX_CUSTOM_RANGE_DAYS, 'day').startOf('day')
    );

  const onRangeChange = (range: TimeRangeKey) => {
    if (range === 'custom') {
      onChange({
        timeRange: 'custom',
        customRange: value.customRange ?? [dayjs().subtract(1, 'day'), dayjs()],
        page: 1
      });
      return;
    }
    onChange({ timeRange: range, page: 1 });
  };

  const liveButton = (
    <Button
      color="primary"
      variant={live ? 'filled' : 'outlined'}
      aria-pressed={live}
      disabled={value.timeRange === 'custom'}
      icon={<span className={cx(styles.liveDot, live && styles.liveDotOn)} />}
      onClick={onToggleLive}
    >
      {t('requestLogs.live')}
    </Button>
  );

  return (
    <Flex justify="space-between" align="center" gap={16} wrap>
      <Flex gap={8} align="center" wrap>
        <Select
          aria-label={t('requestLogs.filter.timeRange')}
          options={localize(TimeRangeOptions)}
          value={value.timeRange}
          onChange={onRangeChange}
          popupMatchSelectWidth={false}
          style={{ width: 150 }}
        />
        {value.timeRange === 'custom' && (
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            allowClear={false}
            disabledDate={disabledDate}
            value={value.customRange}
            onChange={(dates) => {
              if (dates?.[0] && dates?.[1]) {
                onChange({ customRange: [dates[0], dates[1]], page: 1 });
              }
            }}
            style={{ width: 320 }}
          />
        )}
        <Input
          allowClear
          prefix={<SearchOutlined className="text-tertiary" />}
          placeholder={t('requestLogs.filter.search')}
          aria-label={t('requestLogs.filter.search')}
          defaultValue={value.search}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 220 }}
        />
        <SimpleSelect
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          placeholder={t('requestLogs.filter.status')}
          options={localize(StatusOptions)}
          value={value.statuses}
          onChange={(v: RequestLogStatus[]) =>
            onChange({ statuses: v, page: 1 })
          }
          styles={selectStyles(150)}
        />
        <SimpleSelect
          mode="multiple"
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          maxTagCount="responsive"
          placeholder={t('requestLogs.filter.model')}
          options={routeOptions}
          value={value.routeIds}
          onChange={(v: number[]) => onChange({ routeIds: v, page: 1 })}
          styles={selectStyles(180)}
        />
        <SimpleSelect
          mode="multiple"
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          maxTagCount="responsive"
          placeholder={t('requestLogs.filter.apiKey')}
          options={apiKeyOptions}
          value={value.apiKeyIds}
          onChange={(v: number[]) => onChange({ apiKeyIds: v, page: 1 })}
          styles={selectStyles(160)}
        />
        {showUserFilter && (
          <SimpleSelect
            mode="multiple"
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            maxTagCount="responsive"
            placeholder={t('requestLogs.filter.user')}
            options={userOptions}
            value={value.userIds}
            onChange={(v: number[]) => onChange({ userIds: v, page: 1 })}
            styles={selectStyles(150)}
          />
        )}
        <Select
          allowClear
          placeholder={t('requestLogs.filter.stream')}
          aria-label={t('requestLogs.filter.stream')}
          options={localize(StreamOptions)}
          value={streamValue}
          onChange={(v?: string) =>
            onChange({
              stream: v === undefined ? undefined : v === 'stream',
              page: 1
            })
          }
          style={{ width: 140 }}
        />
      </Flex>
      {/* Stays at the end of the row, also when the bar wraps. */}
      <Flex gap={8} align="center" style={{ marginInlineStart: 'auto' }}>
        {value.timeRange === 'custom' ? (
          <Tooltip title={t('requestLogs.live.disabledCustom')}>
            {/* A disabled button swallows hover; the span keeps the tooltip. */}
            <span>{liveButton}</span>
          </Tooltip>
        ) : (
          liveButton
        )}
        <Tooltip title={t('common.button.refresh')}>
          <Button
            type="text"
            aria-label={t('common.button.refresh')}
            style={{ color: 'var(--ant-color-text-tertiary)' }}
            icon={<SyncOutlined spin={refreshing} />}
            onClick={onRefresh}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default FilterToolbar;
