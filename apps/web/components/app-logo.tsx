import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 105,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <span
          className="font-bold text-xl"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--primary-foreground)',
            letterSpacing: '-0.02em'
          }}
        >
          P
        </span>
      </div>
      <span
        className="font-bold text-[22px]"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--foreground)',
          letterSpacing: '-0.02em'
        }}
      >
        PODENZA
      </span>
    </div>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
