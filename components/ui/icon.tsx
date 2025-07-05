'use client';

import { DivideIcon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = Icons[name as keyof typeof Icons] as React.ElementType;
  
  if (!IconComponent) {
    return <Icons.HelpCircle className={className} />;
  }
  
  return <IconComponent className={className} />;
}