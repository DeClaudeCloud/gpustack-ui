import React from 'react';

interface SparklineProps {
  // `null` marks a bucket with no value (no timed requests has no latency,
  // not a latency of 0). The line bridges such gaps between the buckets that
  // do have one, at their true time positions.
  data: (number | null)[];
  color: string;
  width?: number;
  height?: number;
  label: string;
}

/**
 * A word-sized trend line for a stat card. Decorative next to the number it
 * sits under, so it is one SVG path with an accessible name and no axes.
 */
const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 72,
  height = 20,
  label
}) => {
  const points = data
    .map((v, i) => (v === null ? null : { i, v }))
    .filter((p): p is { i: number; v: number } => p !== null);

  const empty = (
    <svg width={width} height={height} role="img" aria-label={label} />
  );
  if (!points.length) return empty;

  const values = points.map((p) => p.v);
  const max = Math.max(...values);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  // A 1.5px inset keeps the stroke and the end dot from clipping.
  const inset = 1.5;
  const x = (i: number) => Math.min(Math.max(i * step, inset), width - inset);
  const y = (v: number) =>
    height - inset - ((v - min) / span) * (height - inset * 2);

  const last = points[points.length - 1];
  const path = points
    .map((p, n) => `${n ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join('');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      {points.length > 1 && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <circle cx={x(last.i)} cy={y(last.v)} r={2} fill={color} />
    </svg>
  );
};

export default Sparkline;
