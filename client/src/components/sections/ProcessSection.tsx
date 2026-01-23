import { cn } from "@/lib/utils";

interface ProcessStep {
  number?: number;
  title: string;
  description: string;
  icon?: string;
}

interface ProcessSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    steps?: ProcessStep[];
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

export function ProcessSection({ id, content, styles = {} }: ProcessSectionProps) {
  const {
    title = "How It Works",
    subtitle = "Simple steps to get started",
    steps = [
      { number: 1, title: "Step 1", description: "Description of the first step" },
      { number: 2, title: "Step 2", description: "Description of the second step" },
      { number: 3, title: "Step 3", description: "Description of the third step" },
    ],
  } = content || {};

  const {
    backgroundColor = "#ffffff",
    textColor = "#1f2937",
    accentColor = "#3b82f6",
  } = styles;

  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor && (
    backgroundColor.toLowerCase().includes('#1') ||
    backgroundColor.toLowerCase().includes('#2') ||
    backgroundColor.toLowerCase().includes('#3') ||
    backgroundColor.toLowerCase().includes('#0') ||
    backgroundColor.toLowerCase().includes('dark') ||
    backgroundColor.toLowerCase().includes('black')
  );

  const effectiveTextColor = isDarkBg ? "#ffffff" : textColor;
  const subtitleColor = isDarkBg ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

  return (
    <section
      id={id}
      className="py-16 md:py-24"
      style={{ backgroundColor }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: effectiveTextColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: subtitleColor }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line (desktop only) */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
            style={{ backgroundColor: `${accentColor}20` }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Number Circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 relative z-10 shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    color: "#ffffff",
                  }}
                >
                  {step.icon ? (
                    <span className="text-2xl">{step.icon}</span>
                  ) : (
                    step.number || index + 1
                  )}
                </div>

                {/* Step Content */}
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: effectiveTextColor }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: subtitleColor }}
                >
                  {step.description}
                </p>

                {/* Arrow connector (mobile only) */}
                {index < steps.length - 1 && (
                  <div
                    className="md:hidden w-0.5 h-8 mt-4"
                    style={{ backgroundColor: `${accentColor}40` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
