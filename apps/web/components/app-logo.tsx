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
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="font-bold text-xl text-primary-foreground tracking-tight">
            P
          </span>
        </div>
      </div>
    );
  }

  // Logo completo cuando esté expandido
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
        <span className="font-bold text-xl text-primary-foreground tracking-tight">
          P
        </span>
      </div>
      <span className="font-bold text-[22px] text-foreground tracking-tight transition-opacity duration-300">
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