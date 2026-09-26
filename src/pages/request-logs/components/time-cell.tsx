import { useIntl } from '@umijs/max';
import { Flex, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ListItem } from '../config/types';

/** Completion time with a relative hint; start and end in the tooltip. */
const TimeCell: React.FC<{ record: ListItem }> = ({ record }) => {
  const intl = useIntl();
  const at = record.completed_at || record.started_at;
  if (!at) return <span>-</span>;
  const tooltip = (
    <Flex vertical>
      <span>
        {intl.formatMessage({ id: 'requestLogs.detail.startedAt' })}:{' '}
        {record.started_at
          ? dayjs(record.started_at).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '-'}
      </span>
      <span>
        {intl.formatMessage({ id: 'requestLogs.detail.completedAt' })}:{' '}
        {record.completed_at
          ? dayjs(record.completed_at).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '-'}
      </span>
    </Flex>
  );
  return (
    <Tooltip title={tooltip} placement="topLeft">
      <Flex vertical style={{ lineHeight: '18px' }}>
        <span
          style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          {dayjs(at).format('MMM DD HH:mm:ss')}
        </span>
        <span
          className="text-secondary"
          style={{ fontSize: 12, whiteSpace: 'nowrap' }}
        >
          {dayjs(at).fromNow()}
        </span>
      </Flex>
    </Tooltip>
  );
};

export default TimeCell;
