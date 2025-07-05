'use client';

import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  // Convert kebab-case to PascalCase for icon names
  const iconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Get the icon component from lucide-react
  const IconComponent = (Icons as any)[iconName] as LucideIcon;

  // Fallback to MoreHorizontal if icon not found
  const FallbackIcon = Icons.MoreHorizontal;

  const Component = IconComponent || FallbackIcon;

  return <Component className={cn("h-4 w-4", className)} />;
}