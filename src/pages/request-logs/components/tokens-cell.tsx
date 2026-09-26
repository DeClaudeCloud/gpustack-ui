import { useIntl } from '@umijs/max';
import { Flex, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import type { ListItem } from '../config/types';
import { formatCount } from '../utils/format';

const useStyles = createStyles(({ css, token }) => ({
  cell: css`
    width: 100%;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
  `,
  // Input count | input bar, centre line, output bar | output count. The two
  // count slots share the leftover width equally, which keeps the centre line
  // in the middle of the column on every row.
  count: css`
    flex: 1;
    min-width: 0;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    white-space: nowrap;
  `,
  bar: css`
    flex: none;
    width: 64px;
    height: 4px;
  `,
  half: css`
    flex: 1;
    height: 100%;
  `,
  centre: css`
    flex: none;
    width: 1px;
    height: 8px;
    margin-block: -2px;
    background-color: ${token.colorBorder};
  `,
  swatch: css`
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-inline-end: 4px;
    border-radius: 1px;
    vertical-align: 1px;
  `
}));

// Share of a half, with a small floor so a non-zero count stays visible.
const share = (value: number, max: number) =>
  max > 0 && value > 0 ? Math.max((value / max) * 100, 6) : 0;

/**
 * Total tokens over a diverging bar: input grows left from a centre line and
 * output grows right, each flanked by its count. Both halves share one scale,
 * the largest input or output count on the page, so their lengths compare
 * across the two sides and across rows. The colours are the Usage page's
 * input / output colours; the counts stay in the text colour (neither palette
 * colour is legible as small text in both themes) and the tooltip names them.
 */
const TokensCell: React.FC<{
  record: ListItem;
  // The largest single input or output count on the page.
  max: number;
  colors: [string, string];
}> = ({ record, max, colors }) => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [inputColor, outputColor] = colors;
  const estimated = !record.completed;

  const t = (id: string) => intl.formatMessage({ id });
  const inputLine = `${t('requestLogs.detail.promptTokens')}: ${record.prompt_tokens.toLocaleString()}`;
  const cachedLine =
    record.cached_tokens > 0
      ? ` (${t('requestLogs.detail.cachedTokens')}: ${record.cached_tokens.toLocaleString()})`
      : '';
  const outputLine = `${t('requestLogs.detail.completionTokens')}: ${record.completion_tokens.toLocaleString()}`;

  const tooltip = (
    <Flex vertical>
      <span>
        <span className={styles.swatch} style={{ background: inputColor }} />
        {inputLine}
        {cachedLine}
      </span>
      <span>
        <span className={styles.swatch} style={{ background: outputColor }} />
        {outputLine}
      </span>
      {estimated && <span>{t('requestLogs.tokens.estimated')}</span>}
    </Flex>
  );

  return (
    <Tooltip title={tooltip}>
      <Flex vertical align="center" gap={2} className={styles.cell}>
        <span>
          {estimated ? '~' : ''}
          {formatCount(record.total_tokens)}
        </span>
        <Flex align="center" gap={6} style={{ width: '100%' }}>
          <span className={styles.count} style={{ textAlign: 'end' }}>
            {formatCount(record.prompt_tokens)}
          </span>
          <Flex className={styles.bar} align="center" aria-hidden>
            <Flex className={styles.half} justify="end">
              <span
                style={{
                  width: `${share(record.prompt_tokens, max)}%`,
                  background: inputColor,
                  borderRadius: '2px 0 0 2px'
                }}
              />
            </Flex>
            <span className={styles.centre} />
            <Flex className={styles.half}>
              <span
                style={{
                  width: `${share(record.completion_tokens, max)}%`,
                  background: outputColor,
                  borderRadius: '0 2px 2px 0'
                }}
              />
            </Flex>
          </Flex>
          <span className={styles.count}>
            {formatCount(record.completion_tokens)}
          </span>
        </Flex>
      </Flex>
    </Tooltip>
  );
};

export default TokensCell;
