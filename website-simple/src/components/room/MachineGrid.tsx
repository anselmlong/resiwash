import { motion } from 'framer-motion';
import { MachineStatusOverview } from '@/types/datatypes';
import { MachineCell } from './MachineCell';
import { containerVariants, itemVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface MachineGridProps {
  machines: MachineStatusOverview[];
  onMachineClick: (machineId: number) => void;
  className?: string;
}

/**
 * MachineGrid component displays a responsive grid of machine cells
 * Layout: CSS Grid
 * - Mobile: 3 columns
 * - Tablet: 4 columns
 * - Desktop: 5 columns
 */
export function MachineGrid({ machines, onMachineClick, className }: MachineGridProps) {
  return (
    <motion.div
      className={cn(
        'grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {machines.map((machine) => (
        <motion.div key={machine.machineId} variants={itemVariants}>
          <MachineCell
            machine={machine}
            onClick={() => onMachineClick(machine.machineId)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
