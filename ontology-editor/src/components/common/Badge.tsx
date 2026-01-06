import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray' | 'custom';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'bg-sf-blue-100 text-sf-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-ontology-100 text-ontology-600',
  custom: '',
};

export function Badge({ children, variant = 'gray', color, className, dot }: BadgeProps) {
  const customStyle = color
    ? {
        backgroundColor: `${color}20`,
        color: color,
      }
    : undefined;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
        variant !== 'custom' && variantStyles[variant],
        className
      )}
      style={variant === 'custom' ? customStyle : undefined}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
