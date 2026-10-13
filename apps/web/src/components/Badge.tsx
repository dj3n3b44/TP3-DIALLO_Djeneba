import type { ReactNode } from 'react';
import type { Severity } from '@trace/core';
import { severityLabel } from '../utils/format';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'amber' | 'quiet';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`badge badge--severity badge--${severity}`}>{severityLabel(severity)}</span>
  );
}
