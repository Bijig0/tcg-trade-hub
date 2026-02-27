import type { ReactNode } from 'react';

type FeatureSectionProps = {
  id?: string;
  title: string;
  description: string;
  visual: ReactNode;
  reversed?: boolean;
};

export const FeatureSection = ({
  id,
  title,
  description,
  visual,
  reversed = false,
}: FeatureSectionProps) => (
  <div
    id={id}
    className={`scroll-mt-20 flex flex-col items-center gap-8 py-12 lg:gap-16 ${
      reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
    }`}
  >
    {/* Text */}
    <div className="flex-1 text-center lg:text-left">
      <h3 className="mb-3 text-2xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
    {/* Visual */}
    <div className="flex w-full max-w-sm flex-shrink-0 items-center justify-center">
      {visual}
    </div>
  </div>
);
