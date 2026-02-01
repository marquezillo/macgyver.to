import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: () => void;
  textColor?: string;
  accentColor?: string;
}

export function PricingToggle({ 
  isAnnual, 
  onToggle, 
  textColor, 
  accentColor 
}: PricingToggleProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="mt-8 flex items-center justify-center gap-4"
    >
      <span className={cn(
        "text-sm font-medium transition-colors",
        !isAnnual ? (textColor || "text-gray-900") : "text-gray-500"
      )}>Monthly</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          isAnnual ? "bg-primary" : "bg-gray-300"
        )}
        style={{ backgroundColor: isAnnual ? (accentColor || '#6366f1') : undefined }}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
            isAnnual ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <span className={cn(
        "text-sm font-medium transition-colors",
        isAnnual ? (textColor || "text-gray-900") : "text-gray-500"
      )}>
        Annual
        <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Save 20%
        </span>
      </span>
    </motion.div>
  );
}
