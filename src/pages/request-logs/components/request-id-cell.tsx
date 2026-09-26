import { AutoTooltip } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import type { ListItem } from '../config/types';

/**
 * The id a caller can quote: the model's response id (`chatcmpl-…`), which is
 * what an SDK hands back, falling back to the gateway request id when the
 * upstream minted none. A real button, so the detail drawer is reachable from
 * the keyboard and not only by clicking the row.
 */
const RequestIdCell: React.FC<{
  record: ListItem;
  onOpen: (record: ListItem) => void;
}> = ({ record, onOpen }) => {
  const intl = useIntl();
  const id = record.upstream_response_id || record.request_id;
  return (
    <Button
      type="link"
      size="small"
      aria-label={intl.formatMessage({ id: 'requestLogs.detail.open' })}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(record);
      }}
      style={{ paddingInline: 0, maxWidth: '100%', height: 'auto' }}
    >
      <AutoTooltip ghost title={id} style={{ maxWidth: 180 }}>
        <span
          style={{ fontFamily: 'var(--ant-font-family-code)', fontSize: 12 }}
        >
          {id || '-'}
        </span>
      </AutoTooltip>
    </Button>
  );
};

export default RequestIdCell;
