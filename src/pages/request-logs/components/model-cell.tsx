import { AutoTooltip } from '@gpustack/core-ui';
import { Flex } from 'antd';
import React from 'react';
import type { ListItem } from '../config/types';

/**
 * The model name the caller asked for (the route), with what served it
 * underneath when that differs: the deployment, or the provider for a
 * provider-backed route.
 */
const ModelCell: React.FC<{ record: ListItem }> = ({ record }) => {
  const requested = record.model_route_name || record.model_name;
  const served = [
    record.model_name !== requested ? record.model_name : null,
    record.provider_name
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Flex vertical style={{ lineHeight: '18px', minWidth: 0 }}>
      <AutoTooltip ghost style={{ maxWidth: 240 }}>
        {requested}
      </AutoTooltip>
      {served && (
        <AutoTooltip ghost style={{ maxWidth: 240 }}>
          <span className="text-secondary" style={{ fontSize: 12 }}>
            {served}
          </span>
        </AutoTooltip>
      )}
    </Flex>
  );
};

export default ModelCell;
