import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MachineStatusOverview } from '@/types/datatypes';
import { StatusBadge } from '@/components/machine/StatusBadge';
import { cn } from '@/lib/utils';

interface MachineCellProps {
  machine: MachineStatusOverview;
  onClick: () => void;
  className?: string;
}

/**
 * MachineCell component displays a compact machine status card
 * Layout:
 * ┌─────────┐
 * │ W1   🟢 │  ← Label + status badge
 * │ 2m      │  ← Time since update
 * └─────────┘
 */
export function MachineCell({ machine, onClick, className }: MachineCellProps) {
  const timeAgo = formatDistanceToNow(new Date(machine.lastUpdated), {
    addSuffix: false,
  }).replace('about ', '').replace('less than a minute', '<1m').replace(' minutes', 'm').replace(' hours', 'h').replace(' hour', 'h');

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-start justify-between',
        'rounded-md border-2 border-dark-border bg-dark-surface p-3',
        'hover:border-accent-dark hover:bg-dark-border',
        'dark:border-light-border dark:bg-light-surface',
        'dark:hover:border-accent-light dark:hover:bg-light-border',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark dark:focus-visible:ring-accent-light',
        'min-h-[80px]',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`View details for ${machine.label}`}
    >
      {/* Top row: Label + Status Badge */}
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-base font-semibold text-dark-text-primary dark:text-light-text-primary">
          {machine.label}
        </span>
        <StatusBadge status={machine.currentStatus} size="md" />
      </div>

      {/* Bottom row: Time since update */}
      <span className="font-mono text-xs text-dark-text-secondary dark:text-light-text-secondary">
        {timeAgo}
      </span>
    </motion.button>
  );
}
