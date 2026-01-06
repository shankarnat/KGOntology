import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export function Icon({ name, className, size = 16, color }: IconProps) {
  // Try to get the icon from Lucide
  const LucideIcon = (LucideIcons as Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>>)[name];

  if (LucideIcon) {
    return (
      <LucideIcon
        className={className}
        size={size}
        style={color ? { color } : undefined}
      />
    );
  }

  // Fallback to a default icon
  return (
    <LucideIcons.Box
      className={className}
      size={size}
      style={color ? { color } : undefined}
    />
  );
}

interface IconBoxProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function IconBox({ name, color, size = 'md', className }: IconBoxProps) {
  return (
    <div
      className={clsx(
        'rounded-lg flex items-center justify-center',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon name={name} size={iconSizes[size]} color={color} />
    </div>
  );
}

export default Icon;
