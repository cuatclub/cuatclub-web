"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "2 วัน 14 ชั่วโมง 30 นาที 43 วินาที" — leading zero units drop off as the deadline nears. */
const formatRemaining = (ms: number): string => {
  const units = [
    { value: Math.floor(ms / DAY_MS), unit: "วัน" },
    { value: Math.floor((ms % DAY_MS) / HOUR_MS), unit: "ชั่วโมง" },
    { value: Math.floor((ms % HOUR_MS) / MINUTE_MS), unit: "นาที" },
    { value: Math.floor((ms % MINUTE_MS) / SECOND_MS), unit: "วินาที" },
  ];
  const firstNonZero = units.findIndex(({ value }) => value > 0);
  const visible = firstNonZero === -1 ? units.slice(-1) : units.slice(firstNonZero);
  return visible.map(({ value, unit }) => `${value} ${unit}`).join(" ");
};

type ApplicationCountdownProps = {
  /** Time left as the server measured it while rendering the page. */
  remainingMs: number;
  className?: string;
};

/**
 * Counts down from the server's own measure of the time left rather than the visitor's clock,
 * so the first render matches the server HTML exactly and a wrong device clock can't misreport
 * the deadline. At zero it refreshes the page, letting the server flip the badge, the apply
 * button, and this line to the closed state together.
 */
export function ApplicationCountdown({ remainingMs, className }: ApplicationCountdownProps) {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const mountedAt = Date.now();
    const interval = window.setInterval(() => setElapsedMs(Date.now() - mountedAt), SECOND_MS);
    return () => window.clearInterval(interval);
  }, []);

  const leftMs = Math.max(0, remainingMs - elapsedMs);

  useEffect(() => {
    if (leftMs === 0) router.refresh();
  }, [leftMs, router]);

  return (
    <p role="timer" className={className}>
      เหลือเวลาอีก {formatRemaining(leftMs)}
    </p>
  );
}
