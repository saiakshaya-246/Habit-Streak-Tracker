import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps extends React.ComponentProps<'svg'> {
  name: string;
  size?: number | string;
  className?: string;
}

export default function LucideIcon({ name, size = 20, className, ...props }: LucideIconProps) {
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent size={size} className={className} {...props} />;
}
