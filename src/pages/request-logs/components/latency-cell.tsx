import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { formatDuration } from '../utils/format';

const useStyles = createStyles(({ css, token }) => ({
  track: css`
    width: 48px;
    height: 4px;
    border-radius: 2px;
    background-color: ${token.colorFillSecondary};
    overflow: hidden;
    flex: none;
  `,
  fill: css`
    height: 100%;
    border-radius: 2px;
  `,
  value: css`
    min-width: 52px;
    text-align: end;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  `
}));

/**
 * A duration with a bar scaled to the slowest request on the page, so the
 * slow ones stand out while scanning. The bar is a graphic next to the number
 * that states the value, never the only carrier of it.
 */
const LatencyCell: React.FC<{ value?: number | null; max: number }> = ({
  value,
  max
}) => {
  const { styles } = useStyles();
  if (value === null || value === undefined) return <span>-</span>;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const color =
    ratio > 0.66
      ? 'var(--color-status-warning-dot)'
      : 'var(--color-status-success-dot)';
  return (
    <Flex align="center" gap={8}>
      <span className={styles.value}>{formatDuration(value)}</span>
      <span className={styles.track} aria-hidden>
        <span
          className={styles.fill}
          style={{
            display: 'block',
            width: `${Math.max(ratio * 100, 4)}%`,
            backgroundColor: color
          }}
        />
      </span>
    </Flex>
  );
};

export default LatencyCell;
