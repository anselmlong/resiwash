import { formatDistanceToNow } from 'date-fns';
import { MachineStatusOverview, MachineStatus } from '@/types/datatypes';
import { StatusBadge } from '@/components/machine/StatusBadge';
import { MachineGrid } from './MachineGrid';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  areaName: string;
  roomName: string;
  machines: MachineStatusOverview[];
  onMachineClick: (machineId: number) => void;
  isPinned?: boolean;
  className?: string;
}

/**
 * RoomCard component displays a room with its machines
 * Layout:
 * ╔═══════════════════════════════════╗
 * ║ FLOOR 3 LAUNDRY                   ║
 * ║ 4/7 AVAILABLE                     ║  ← Hero availability count
 * ║ ━━━━━━━━━━                        ║  ← Progress bar
 * ║                                   ║
 * ║ [MachineGrid]                     ║
 * ║                                   ║
 * ║ Updated 12s ago                   ║
 * ╚═══════════════════════════════════╝
 */
function sortMachinesByLabel(machines: MachineStatusOverview[]) {
  return [...machines].sort((a, b) => {
    const aMatch = a.label.match(/\d+/);
    const bMatch = b.label.match(/\d+/);

    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[0], 10);
      const bNum = parseInt(bMatch[0], 10);
      return aNum - bNum;
    }

    return a.label.localeCompare(b.label);
  });
}

export function RoomCard({
  roomName,
  machines,
  onMachineClick,
  isPinned = false,
  className,
}: RoomCardProps) {
  const washers = machines.filter((m) => m.type === 'washer');
  const dryers = machines.filter((m) => m.type === 'dryer');

  const availableWashers = washers.filter(
    (m) => m.currentStatus === MachineStatus.AVAILABLE
  ).length;
  const availableDryers = dryers.filter(
    (m) => m.currentStatus === MachineStatus.AVAILABLE
  ).length;

  const sortedWashers = sortMachinesByLabel(washers);
  const sortedDryers = sortMachinesByLabel(dryers);

  const mostRecentUpdate = machines.reduce((latest, machine) => {
    const machineTime = new Date(machine.lastUpdated).getTime();
    return machineTime > latest ? machineTime : latest;
  }, 0);

  const timeAgo = mostRecentUpdate
    ? formatDistanceToNow(new Date(mostRecentUpdate), { addSuffix: true })
    : 'Never';

  return (
    <Card className={cn('overflow-hidden', isPinned && 'border-accent-dark dark:border-accent-light', className)}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-dark-text-primary dark:text-light-text-primary">
            {roomName}
          </h2>
          {isPinned && (
            <span className="text-xs font-mono text-accent-dark dark:text-accent-light">
              PRIMARY
            </span>
          )}
        </div>

        <div className="space-y-3" role="status" aria-live="polite">
          {/* Washers status bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-24 shrink-0 font-mono text-sm font-semibold text-secondary">
              Washers
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {sortedWashers.length > 0 ? (
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1">
                  {sortedWashers.map((machine) => (
                    <div
                      key={machine.machineId}
                      className="shrink-0"
                      title={`${machine.label}: ${machine.currentStatus}`}
                    >
                      <StatusBadge status={machine.currentStatus} size="md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-w-0 flex-1 font-mono text-sm text-secondary">
                  No washers
                </div>
              )}
              <div className="shrink-0 font-mono text-sm font-bold text-primary">
                {availableWashers}/{washers.length}
              </div>
            </div>
          </div>

          {/* Dryers status bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-24 shrink-0 font-mono text-sm font-semibold text-secondary">
              Dryers
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {sortedDryers.length > 0 ? (
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1">
                  {sortedDryers.map((machine) => (
                    <div
                      key={machine.machineId}
                      className="shrink-0"
                      title={`${machine.label}: ${machine.currentStatus}`}
                    >
                      <StatusBadge status={machine.currentStatus} size="md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-w-0 flex-1 font-mono text-sm text-secondary">
                  No dryers
                </div>
              )}
              <div className="shrink-0 font-mono text-sm font-bold text-primary">
                {availableDryers}/{dryers.length}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Machine grid */}
        <MachineGrid machines={machines} onMachineClick={onMachineClick} />

        {/* Last updated timestamp */}
        <div className="pt-2 text-right font-mono text-xs text-dark-text-secondary dark:text-light-text-secondary">
          Updated {timeAgo}
        </div>
      </CardContent>
    </Card>
  );
}
