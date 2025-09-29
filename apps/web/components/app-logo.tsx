import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 105,
  collapsed = false,
}: {
  className?: string;
  width?: number;
  collapsed?: boolean;
}) {
  if (collapsed) {
    // Solo mostrar la "P" cuando esté colapsado
    return (
      <div className={cn("flex items-center justify-center", className)}>
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
      </div>
    );
  }

  // Logo completo cuando esté expandido
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
        className="font-bold text-[22px] transition-opacity duration-300"
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
  collapsed = false,
}: {
  href?: string | null;
  className?: string;
  label?: string;
  collapsed?: boolean;
}) {
  if (href === null) {
    return <LogoImage className={className} collapsed={collapsed} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} collapsed={collapsed} />
    </Link>
  );
}
