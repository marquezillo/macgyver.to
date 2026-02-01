import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PricingCard, 
  PricingToggle, 
  type Plan, 
  type PricingStyles,
  defaultPlans, 
  containerVariants 
} from './pricing';

interface PricingSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    badge?: string;
    plans?: Plan[];
    layout?: 'cards' | 'horizontal' | 'comparison' | 'minimal' | 'gradient';
    note?: string;
    showToggle?: boolean;
    comparisonFeatures?: string[];
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    cardBg?: string;
    highlightedBg?: string;
  };
}

export function PricingSection({ id, content, styles = {} }: PricingSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const plans = content?.plans || defaultPlans;

  const layout = content?.layout || 'cards';
  const showToggle = content?.showToggle !== false;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Sparkles, Shield];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  // Toggle Component
  const renderToggle = () => (
    showToggle && (
      <PricingToggle
        isAnnual={isAnnual}
        onToggle={() => setIsAnnual(!isAnnual)}
        textColor={styles?.textColor}
        accentColor={styles?.accentColor}
      />
    )
  );

  // Cards Layout (Default)
  const renderCardsLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(
        "grid gap-4 sm:gap-6 lg:gap-8",
        plans.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto" :
        plans.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {plans.map((plan, index) => (
        <PricingCard
          key={index}
          plan={plan}
          index={index}
          isAnnual={isAnnual}
          isHovered={hoveredPlan === index}
          onHover={setHoveredPlan}
          styles={styles}
        />
      ))}
    </motion.div>
  );

  // Horizontal Layout
  const renderHorizontalLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-4"
    >
      {plans.map((plan, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          className={cn(
            "relative rounded-2xl p-6 md:p-8 transition-all duration-300",
            plan.highlighted 
              ? "bg-gray-900 text-white shadow-xl ring-2" 
              : "bg-white border border-gray-200 shadow-md hover:shadow-lg"
          )}
          style={{
            backgroundColor: plan.highlighted 
              ? (styles?.highlightedBg || '#1a1a1a') 
              : (styles?.cardBg || '#ffffff'),
            borderColor: plan.highlighted ? (styles?.accentColor || '#6366f1') : undefined
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Plan Info */}
            <div className="flex items-center gap-4 flex-1">
              <div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  plan.highlighted ? "bg-white/10" : "bg-gray-100"
                )}
                style={{ color: plan.highlighted ? '#fff' : (styles?.accentColor || '#6366f1') }}
              >
                {getPlanIcon(index)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    plan.highlighted ? "text-white" : "text-gray-900"
                  )}>
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-sm mt-1",
                  plan.highlighted ? "text-gray-300" : "text-gray-500"
                )}>
                  {plan.description}
                </p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="flex-1 hidden lg:flex items-center gap-4 flex-wrap">
              {(plan.features || []).slice(0, 4).map((feature, i) => (
                <span 
                  key={i}
                  className={cn(
                    "text-xs px-3 py-1 rounded-full",
                    plan.highlighted 
                      ? "bg-white/10 text-gray-300" 
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {feature}
                </span>
              ))}
              {(plan.features || []).length > 4 && (
                <span className={cn(
                  "text-xs",
                  plan.highlighted ? "text-gray-400" : "text-gray-500"
                )}>
                  +{(plan.features || []).length - 4} more
                </span>
              )}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className={cn(
                  "text-3xl font-bold",
                  plan.highlighted ? "text-white" : "text-gray-900"
                )}>
                  {isAnnual ? (plan.annualPrice || plan.price) : plan.price}
                </div>
                <div className={cn(
                  "text-sm",
                  plan.highlighted ? "text-gray-400" : "text-gray-500"
                )}>
                  {plan.period || '/month'}
                </div>
              </div>
              <Button
                className={cn(
                  "px-6 py-5 font-semibold whitespace-nowrap",
                  plan.highlighted 
                    ? "bg-white text-gray-900 hover:bg-gray-100" 
                    : ""
                )}
                style={{ 
                  backgroundColor: !plan.highlighted ? (styles?.accentColor || '#6366f1') : undefined,
                  color: !plan.highlighted ? '#ffffff' : undefined
                }}
              >
                {plan.ctaText || 'Get Started'}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Comparison Table Layout
  const renderComparisonLayout = () => {
    const allFeatures = content?.comparisonFeatures || 
      Array.from(new Set(plans.flatMap(p => [...(p.features || []), ...(p.notIncluded || [])])));

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="overflow-x-auto"
      >
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left p-4 w-1/4">
                <span className={cn(
                  "text-sm font-medium",
                  styles?.textColor ? "opacity-60" : "text-gray-500"
                )}>
                  Features
                </span>
              </th>
              {plans.map((plan, index) => (
                <th key={index} className="p-4 text-center">
                  <div 
                    className={cn(
                      "rounded-xl p-6 transition-all",
                      plan.highlighted 
                        ? "bg-gray-900 text-white shadow-lg" 
                        : "bg-gray-50"
                    )}
                    style={{
                      backgroundColor: plan.highlighted 
                        ? (styles?.highlightedBg || '#1a1a1a') 
                        : undefined
                    }}
                  >
                    {plan.badge && (
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-full text-white mb-2 inline-block"
                        style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                      >
                        {plan.badge}
                      </span>
                    )}
                    <h3 className={cn(
                      "text-lg font-semibold",
                      plan.highlighted ? "text-white" : "text-gray-900"
                    )}>
                      {plan.name}
                    </h3>
                    <div className={cn(
                      "text-3xl font-bold mt-2",
                      plan.highlighted ? "text-white" : "text-gray-900"
                    )}>
                      {isAnnual ? (plan.annualPrice || plan.price) : plan.price}
                      <span className={cn(
                        "text-sm font-normal",
                        plan.highlighted ? "text-gray-400" : "text-gray-500"
                      )}>
                        {plan.period || '/mo'}
                      </span>
                    </div>
                    <Button
                      className={cn(
                        "mt-4 w-full",
                        plan.highlighted 
                          ? "bg-white text-gray-900 hover:bg-gray-100" 
                          : ""
                      )}
                      style={{ 
                        backgroundColor: !plan.highlighted ? (styles?.accentColor || '#6366f1') : undefined,
                        color: !plan.highlighted ? '#ffffff' : undefined
                      }}
                      size="sm"
                    >
                      {plan.ctaText || 'Get Started'}
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, featureIndex) => (
              <tr 
                key={featureIndex}
                className={cn(
                  "border-t border-gray-100",
                  featureIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm",
                      styles?.textColor || "text-gray-700"
                    )}>
                      {feature}
                    </span>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </div>
                </td>
                {plans.map((plan, planIndex) => {
                  const hasFeature = (plan.features || []).includes(feature);
                  return (
                    <td key={planIndex} className="p-4 text-center">
                      {hasFeature ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  };

  // Minimal Layout
  const renderMinimalLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col md:flex-row items-stretch justify-center gap-0 max-w-4xl mx-auto"
    >
      {plans.map((plan, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          className={cn(
            "flex-1 p-8 text-center transition-all duration-300 border-y md:border-y-0 md:border-x border-gray-200",
            index === 0 && "md:rounded-l-2xl md:border-l",
            index === plans.length - 1 && "md:rounded-r-2xl md:border-r",
            plan.highlighted && "bg-gray-50"
          )}
        >
          {plan.badge && (
            <span 
              className="text-xs font-medium px-3 py-1 rounded-full text-white mb-4 inline-block"
              style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
            >
              {plan.badge}
            </span>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900">
              {isAnnual ? (plan.annualPrice || plan.price) : plan.price}
            </span>
            <span className="text-gray-500">{plan.period || '/mo'}</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
          <Button
            className="mt-6 w-full"
            variant={plan.highlighted ? "default" : "outline"}
            style={{ 
              backgroundColor: plan.highlighted ? (styles?.accentColor || '#6366f1') : undefined,
              color: plan.highlighted ? '#ffffff' : undefined
            }}
          >
            {plan.ctaText || 'Get Started'}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );

  // Gradient Layout
  const renderGradientLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(
        "grid gap-4 sm:gap-6",
        plans.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto" :
        plans.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {plans.map((plan, index) => {
        const gradients = [
          'from-blue-500 to-purple-600',
          'from-purple-500 to-pink-600',
          'from-orange-500 to-red-600',
          'from-green-500 to-teal-600'
        ];
        const gradient = gradients[index % gradients.length];

        return (
          <motion.div
            key={index}
            variants={cardVariants}
            className="relative group"
          >
            {/* Gradient Background */}
            <div 
              className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl",
                gradient
              )}
            />
            
            <div 
              className={cn(
                "relative rounded-2xl p-8 bg-white border border-gray-200 shadow-lg transition-all duration-300",
                "group-hover:border-transparent group-hover:shadow-2xl"
              )}
            >
              {plan.badge && (
                <div 
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r",
                    gradient
                  )}
                >
                  {plan.badge}
                </div>
              )}

              <div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br text-white",
                  gradient
                )}
              >
                {getPlanIcon(index)}
              </div>

              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {isAnnual ? (plan.annualPrice || plan.price) : plan.price}
                </span>
                <span className="ml-1 text-gray-500">{plan.period || '/month'}</span>
              </div>

              <Button
                className={cn(
                  "mt-6 w-full bg-gradient-to-r text-white border-0",
                  gradient
                )}
              >
                {plan.ctaText || 'Get Started'}
              </Button>

              <ul className="mt-6 space-y-3">
                {(plan.features || []).slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

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
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          {content?.badge && (
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120',
                color: styles?.accentColor || '#6366f1'
              }}
            >
              {content.badge}
            </motion.span>
          )}
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
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

          {renderToggle()}
        </div>

        {/* Pricing by Layout */}
        {layout === 'horizontal' ? renderHorizontalLayout() :
         layout === 'comparison' ? renderComparisonLayout() :
         layout === 'minimal' ? renderMinimalLayout() :
         layout === 'gradient' ? renderGradientLayout() :
         renderCardsLayout()}

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
