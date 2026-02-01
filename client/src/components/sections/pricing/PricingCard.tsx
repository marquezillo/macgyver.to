import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Plan, PricingStyles, cardVariants } from './pricingUtils';

interface PricingCardProps {
  plan: Plan;
  index: number;
  isAnnual: boolean;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  styles?: PricingStyles;
}

export function PricingCard({ 
  plan, 
  index, 
  isAnnual, 
  isHovered, 
  onHover, 
  styles 
}: PricingCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "relative rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300",
        plan.highlighted 
          ? "bg-gray-900 text-white shadow-2xl scale-105 z-10" 
          : "bg-white border border-gray-200 shadow-lg hover:shadow-xl",
        isHovered && !plan.highlighted && "scale-[1.02]"
      )}
      style={{
        backgroundColor: plan.highlighted 
          ? (styles?.highlightedBg || '#1a1a1a') 
          : (styles?.cardBg || '#ffffff')
      }}
    >
      {plan.badge && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
        >
          {plan.badge}
        </div>
      )}

      <h3 className={cn(
        "text-xl font-semibold",
        plan.highlighted ? "text-white" : "text-gray-900"
      )}>
        {plan.name}
      </h3>
      <p className={cn(
        "mt-2 text-sm",
        plan.highlighted ? "text-gray-300" : "text-gray-500"
      )}>
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline">
        <span className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
          plan.highlighted ? "text-white" : "text-gray-900"
        )}>
          {isAnnual ? (plan.annualPrice || plan.price) : plan.price}
        </span>
        <span className={cn(
          "ml-1 text-lg",
          plan.highlighted ? "text-gray-300" : "text-gray-500"
        )}>
          {plan.period || '/month'}
        </span>
      </div>

      <Button
        className={cn(
          "mt-8 w-full py-6 text-lg font-semibold",
          plan.highlighted 
            ? "bg-white text-gray-900 hover:bg-gray-100" 
            : ""
        )}
        style={{ 
          backgroundColor: !plan.highlighted ? (styles?.accentColor || '#6366f1') : undefined,
          color: !plan.highlighted ? '#ffffff' : undefined
        }}
        variant={plan.highlighted ? "secondary" : "default"}
      >
        {plan.ctaText || 'Get Started'}
      </Button>

      <ul className="mt-8 space-y-4">
        {(plan.features || []).map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className={cn(
              "h-5 w-5 flex-shrink-0",
              plan.highlighted ? "text-green-400" : "text-green-500"
            )} />
            <span className={cn(
              "text-sm",
              plan.highlighted ? "text-gray-300" : "text-gray-600"
            )}>
              {feature}
            </span>
          </li>
        ))}
        {(plan.notIncluded || []).map((feature, featureIndex) => (
          <li key={`not-${featureIndex}`} className="flex items-start gap-3 opacity-50">
            <X className={cn(
              "h-5 w-5 flex-shrink-0",
              plan.highlighted ? "text-gray-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm line-through",
              plan.highlighted ? "text-gray-500" : "text-gray-400"
            )}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
