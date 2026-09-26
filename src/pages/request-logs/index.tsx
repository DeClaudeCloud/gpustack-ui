/**
 * Usage > Request Logs — one row per inference request, newest first, with a
 * live tail.
 *
 * Everything on the page (toolbar, stat cards, volume chart, table) is driven
 * by one `QueryState`. Every user action goes through `load`, which merges the
 * change, resolves the time window once, and fetches the page and the stats
 * for exactly that window together. The live tail is the same `load` on a
 * timer, re-anchoring the relative window on "now" each tick.
 */
import { IconFont, NoResult, useBodyScroll } from '@gpustack/core-ui';
import { useAccess, useIntl } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { Flex, Table, type TablePaginationConfig } from 'antd';
import { createStyles, keyframes } from 'antd-style';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import PageBox from '../_components/page-box';
import FilterToolbar from './components/filter-toolbar';
import LogDetailDrawer from './components/log-detail-drawer';
import StatCards from './components/stat-cards';
import VolumeChart from './components/volume-chart';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_TIME_RANGE,
  LIVE_POLL_INTERVAL
} from './config';
import type { ListItem, QueryState } from './config/types';
import useLiveTail from './hooks/use-live-tail';
import useRequestLogColumns from './hooks/use-request-log-columns';
import useQueryFilterOptions from './services/use-query-filter-options';
import useQueryRequestLogStats from './services/use-query-request-log-stats';
import useQueryRequestLogs from './services/use-query-request-logs';
import { hasActiveFilters, toFilterParams, toListParams } from './utils/query';

const flash = keyframes`
  from { background-color: var(--ant-color-primary-bg); }
  to { background-color: transparent; }
`;

const useStyles = createStyles(({ css, token }) => ({
  freshRow: css`
    > td {
      animation: ${flash} 2.4s ease-out;
    }
    @media (prefers-reduced-motion: reduce) {
      > td {
        animation: none;
      }
    }
  `,
  row: css`
    cursor: pointer;
  `,
  liveBanner: css`
    padding: 6px 12px;
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorFillQuaternary};
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `
}));

const INITIAL_STATE: QueryState = {
  timeRange: DEFAULT_TIME_RANGE,
  statuses: [],
  routeIds: [],
  apiKeyIds: [],
  userIds: [],
  search: '',
  page: 1,
  perPage: DEFAULT_PAGE_SIZE
};

type LoadMode = 'initial' | 'refresh' | 'tick';

const RequestLogs: React.FC = () => {
  const access = useAccess();
  const intl = useIntl();
  const { styles } = useStyles();
  // Platform admin / Org owner see every caller in their tenant, everyone
  // else only their own requests (the server enforces the same downgrade).
  const canSeeAll = !!access.canSeeOrgAdmin;
  const scope = canSeeAll ? 'all' : 'self';

  const [query, setQuery] = useState<QueryState>(INITIAL_STATE);
  const queryRef = useRef(query);
  const [view, setView] = useState<{
    loading: boolean;
    refreshing: boolean;
    updatedAt?: dayjs.Dayjs;
    freshIds: Set<number>;
  }>({ loading: true, refreshing: false, freshIds: new Set() });
  const [detail, setDetail] = useState<ListItem | null>(null);
  const { saveScrollHeight, restoreScrollHeight } = useBodyScroll();

  const openDetail = useMemoizedFn((record: ListItem) => {
    saveScrollHeight();
    setDetail(record);
  });

  const closeDetail = () => {
    setDetail(null);
    restoreScrollHeight();
  };

  const { detailData: page, fetchData: fetchList } = useQueryRequestLogs();
  const { detailData: stats, fetchData: fetchStats } =
    useQueryRequestLogStats();
  const filterOptions = useQueryFilterOptions();

  const load = useMemoizedFn(
    async (patch: Partial<QueryState> = {}, mode: LoadMode = 'refresh') => {
      const next = { ...queryRef.current, ...patch };
      queryRef.current = next;
      setQuery(next);
      if (mode !== 'tick') {
        setView((v) => ({
          ...v,
          loading: mode === 'initial' || v.loading,
          refreshing: mode === 'refresh'
        }));
      }
      const previousIds = new Set((page?.items ?? []).map((r) => r.id));
      const filterParams = toFilterParams(next, scope);
      try {
        const [list] = await Promise.all([
          fetchList(toListParams(filterParams, next)),
          fetchStats(filterParams)
        ]);
        setView({
          loading: false,
          refreshing: false,
          updatedAt: dayjs(),
          // Only a tick marks rows as new: after a filter or page change every
          // row is "new" and flashing them all would say nothing.
          freshIds:
            mode === 'tick' && previousIds.size
              ? new Set(
                  list.items
                    .filter((r) => !previousIds.has(r.id))
                    .map((r) => r.id)
                )
              : new Set()
        });
      } catch {
        setView((v) => ({ ...v, loading: false, refreshing: false }));
        throw new Error('request-logs load failed');
      }
    }
  );

  const liveTail = useLiveTail({
    interval: LIVE_POLL_INTERVAL,
    // A failing tick stops the tail rather than repeating the error toast
    // every few seconds.
    onTick: () => load({}, 'tick').catch(() => liveTail.stop())
  });

  const safeLoad = (patch: Partial<QueryState>, mode?: LoadMode) =>
    load(patch, mode).catch(() => {});

  const handleFilterChange = useMemoizedFn((patch: Partial<QueryState>) => {
    // The live tail follows a sliding window; a fixed one has no "new".
    if (patch.timeRange === 'custom') liveTail.stop();
    safeLoad(patch);
  });

  const handleToggleLive = () => {
    if (liveTail.live) {
      liveTail.stop();
      return;
    }
    // Tailing means the newest rows on top: first page, default order.
    queryRef.current = { ...queryRef.current, page: 1, sortBy: undefined };
    liveTail.start();
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<ListItem> | SorterResult<ListItem>[],
    extra: { action: string }
  ) => {
    if (extra.action === 'sort') {
      const s = Array.isArray(sorter) ? sorter[0] : sorter;
      const sortBy = s?.order
        ? `${s.order === 'descend' ? '-' : ''}${String(s.columnKey)}`
        : undefined;
      // Any order but newest-first would bury new rows mid-page.
      if (sortBy && sortBy !== '-created_at') liveTail.stop();
      safeLoad({ sortBy, page: 1 });
      return;
    }
    if (extra.action === 'paginate') {
      const nextPage = pagination.current ?? 1;
      if (nextPage !== 1) liveTail.stop();
      safeLoad({
        page: nextPage,
        perPage: pagination.pageSize ?? DEFAULT_PAGE_SIZE
      });
    }
  };

  const columns = useRequestLogColumns({
    dataList: page?.items ?? [],
    sortBy: query.sortBy,
    showUser: canSeeAll,
    onOpen: openDetail
  });

  // First load only; every later fetch is triggered by an action.
  useEffect(() => {
    safeLoad({}, 'initial');
    filterOptions.fetchData({ scope });
  }, []);

  const emptyText = (
    <NoResult
      minHeight={320}
      loading={view.loading}
      loadend={!view.loading}
      dataSource={page?.items ?? []}
      image={<IconFont type="icon-logs" />}
      // NoResult switches to `noFoundText` when any filter value is set; the
      // time window alone is not a filter.
      filters={hasActiveFilters(query) ? { active: true } : {}}
      noFoundText={intl.formatMessage({ id: 'requestLogs.empty.filtered' })}
      title={intl.formatMessage({ id: 'requestLogs.empty.window' })}
      subTitle={intl.formatMessage({ id: 'requestLogs.empty.subTitle' })}
    />
  );

  return (
    <PageBox>
      <Flex vertical gap={16}>
        <FilterToolbar
          value={query}
          routeOptions={filterOptions.routeOptions}
          apiKeyOptions={filterOptions.apiKeyOptions}
          userOptions={filterOptions.userOptions}
          showUserFilter={canSeeAll}
          live={liveTail.live}
          refreshing={view.refreshing}
          onChange={handleFilterChange}
          onToggleLive={handleToggleLive}
          onRefresh={() => safeLoad({})}
        />
        <StatCards
          stats={stats?.buckets ? stats : undefined}
          loading={view.loading}
        />
        <VolumeChart
          stats={stats?.buckets ? stats : undefined}
          loading={view.loading}
        />
        {liveTail.live && (
          <Flex
            align="center"
            justify="space-between"
            className={styles.liveBanner}
            role="status"
            aria-live="polite"
          >
            <span>{intl.formatMessage({ id: 'requestLogs.live.banner' })}</span>
            {view.updatedAt && (
              <span>
                {intl.formatMessage(
                  { id: 'requestLogs.live.updatedAt' },
                  { time: view.updatedAt.format('HH:mm:ss') }
                )}
              </span>
            )}
          </Flex>
        )}
        {/* antd Table rather than core-ui's: the log needs a row click
            (opening the detail drawer) and a row class (flashing rows new
            since the last live-tail tick), and core-ui's Table exposes
            neither. The request-id cell is the keyboard path to the drawer. */}
        <Table<ListItem>
          className="scroll-table"
          rowKey="id"
          columns={columns}
          dataSource={page?.items ?? []}
          loading={{
            spinning: view.loading || view.refreshing,
            size: 'middle'
          }}
          scroll={{ x: 'max-content' }}
          showSorterTooltip={false}
          sortDirections={['descend', 'ascend', null]}
          locale={{ emptyText }}
          onChange={handleTableChange as any}
          rowClassName={(record) =>
            view.freshIds.has(record.id)
              ? `${styles.row} ${styles.freshRow}`
              : styles.row
          }
          onRow={(record) => ({ onClick: () => openDetail(record) })}
          pagination={{
            size: 'middle',
            current: query.page,
            pageSize: query.perPage,
            total: page?.pagination?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [25, 50, 100, 200],
            hideOnSinglePage: false,
            showTotal: (total) =>
              intl.formatMessage({ id: 'requestLogs.table.total' }, { total })
          }}
        />
      </Flex>
      <LogDetailDrawer record={detail} onClose={closeDetail} />
    </PageBox>
  );
};

export default RequestLogs;
