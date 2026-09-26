import { usePageVisibility } from '@gpustack/core-ui';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useRef, useState } from 'react';

/**
 * Drives the live tail: while on, `onTick` runs every `interval` ms.
 *
 * The timer is released while the browser tab is hidden and restarted (with
 * an immediate tick, so the view catches up) when it is shown again. A tick
 * that is still in flight when the next one is due is not doubled up.
 */
export default function useLiveTail(options: {
  interval: number;
  onTick: () => Promise<unknown>;
}) {
  const { interval } = options;
  const [live, setLive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);

  const tick = useMemoizedFn(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await options.onTick();
    } finally {
      inFlightRef.current = false;
    }
  });

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(tick, interval);
  };

  const start = useMemoizedFn(() => {
    setLive(true);
    tick();
    startTimer();
  });

  const stop = useMemoizedFn(() => {
    setLive(false);
    clearTimer();
  });

  usePageVisibility({
    enabled: live,
    onHidden: clearTimer,
    onVisible: () => {
      tick();
      startTimer();
    }
  });

  useEffect(() => clearTimer, []);

  return { live, start, stop };
}
