import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 'h-6 w-6', text: 'text-base' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-14 w-14', text: 'text-3xl' },
};

export function Logo({ size = 'md', iconOnly = false, className }: LogoProps) {
  const uid = useId();
  const clipId = `logo-clip-${uid}`.replace(/:/g, '');
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={s.icon}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="16" cy="16" r="15" />
          </clipPath>
        </defs>
        <circle cx="16" cy="16" r="15" fill="#F97316" />
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M 0 10.5 C 8 0 24 0 32 10.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 0 21.5 C 8 32 24 32 32 21.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 16 0 C 6 9 26 23 16 32"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {!iconOnly && (
        <span
          className={cn(
            'font-bold tracking-tight text-foreground leading-none',
            s.text,
          )}
        >
          Courtio
        </span>
      )}
    </div>
  );
}
