import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function PricingSection({ id, content, styles = {} }: PricingSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = content?.plans || [
    {
      name: 'Starter',
      price: '$29',
      annualPrice: '$24',
      period: '/month',
      description: 'Perfect for individuals and small projects',
      features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'],
      notIncluded: ['Priority Support', 'Custom Domain', 'API Access'],
      ctaText: 'Get Started',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '$79',
      annualPrice: '$66',
      period: '/month',
      description: 'Best for growing businesses',
      features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domain', 'API Access'],
      notIncluded: [],
      ctaText: 'Start Free Trial',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: '$199',
      annualPrice: '$166',
      period: '/month',
      description: 'For large organizations',
      features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'],
      notIncluded: [],
      ctaText: 'Contact Sales',
      highlighted: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight",
              styles?.textColor || "text-gray-900"
            )}
          >
            {content?.title || "Simple, Transparent Pricing"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn(
              "mt-4 text-lg max-w-2xl mx-auto",
              styles?.textColor ? "opacity-70" : "text-gray-600"
            )}
            style={{ color: styles?.textColor }}
          >
            {content?.subtitle || "Choose the plan that's right for you"}
          </motion.p>

          {/* Toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <span className={cn(
              "text-sm font-medium",
              !isAnnual ? "text-gray-900" : "text-gray-500"
            )}>Monthly</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAnnual(!isAnnual);
              }}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isAnnual ? "bg-primary" : "bg-gray-300"
              )}
              style={{ backgroundColor: isAnnual ? (styles?.accentColor || '#6366f1') : undefined }}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isAnnual ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium",
              isAnnual ? "text-gray-900" : "text-gray-500"
            )}>
              Annual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {plans.map((plan: any, index: number) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                plan.highlighted 
                  ? "bg-gray-900 text-white shadow-2xl scale-105 z-10" 
                  : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
              )}
              style={{
                backgroundColor: plan.highlighted 
                  ? (styles?.highlightedBg || '#1a1a1a') 
                  : (styles?.cardBg || '#ffffff')
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold text-white"
                  style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
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

              {/* Price */}
              <div className="mt-6 flex items-baseline">
                <span className={cn(
                  "text-5xl font-bold tracking-tight",
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

              {/* CTA Button */}
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

              {/* Features */}
              <ul className="mt-8 space-y-4">
                {(plan.features || []).map((feature: string, featureIndex: number) => (
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
                {(plan.notIncluded || []).map((feature: string, featureIndex: number) => (
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
          ))}
        </motion.div>

        {/* Bottom Note */}
        {content?.note && (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            {content.note}
          </motion.p>
        )}
      </div>
    </div>
  );
}
