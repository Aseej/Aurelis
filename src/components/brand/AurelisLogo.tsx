import React, { useState } from 'react';

export type AurelisLogoVariant = 'master' | 'full' | 'emblem';

interface AurelisLogoProps {
  variant?: AurelisLogoVariant;
  size?: number;
  className?: string;
  alt?: string;
  roundedClassName?: string;
  priority?: boolean;
}

const LOGO_SOURCES: Record<AurelisLogoVariant, string> = {
  master: '/assets/aistudio/file_00000000f2cc8211821582742581a071_43c3f0e8.webp',
  full: '/assets/aurelis-logo-full.webp',
  emblem: '/assets/aurelis-emblem-256.webp',
};

export const AurelisLogo: React.FC<AurelisLogoProps> = ({
  variant = 'emblem',
  size = 32,
  className = '',
  alt = 'AURELIS — Where knowledge meets the light of discovery',
  roundedClassName,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const defaultRounded =
    size >= 80
      ? 'rounded-3xl'
      : size >= 44
      ? 'rounded-2xl'
      : size >= 28
      ? 'rounded-xl'
      : 'rounded-lg';

  const radiusClass = roundedClassName ?? defaultRounded;

  if (hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex shrink-0 items-center justify-center bg-[#090B10] border border-[#E6C27A]/35 text-[#E6C27A] select-none ${radiusClass} ${className}`}
        aria-label={alt}
      >
        <span className="font-serif font-semibold tracking-wider text-xs">A</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden bg-[#04060B] border border-[#E6C27A]/25 dark:border-[#E6C27A]/30 shadow-sm select-none ${radiusClass} ${className}`}
    >
      <img
        src={LOGO_SOURCES[variant]}
        alt={alt}
        width={size}
        height={size}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-center block"
      />
      {/* Subtle obsidian glass top edge specular sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
      />
    </div>
  );
};

interface AurelisBrandLockupProps {
  logoSize?: number;
  variant?: AurelisLogoVariant;
  subtitle?: string;
  showSubtitle?: boolean;
  titleSizeClassName?: string;
  className?: string;
}

export const AurelisBrandLockup: React.FC<AurelisBrandLockupProps> = ({
  logoSize = 32,
  variant = 'emblem',
  subtitle,
  showSubtitle = true,
  titleSizeClassName = 'text-base',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <AurelisLogo variant={variant} size={logoSize} priority />
      <div className="flex flex-col min-w-0">
        <span
          className={`font-serif ${titleSizeClassName} font-semibold tracking-[0.16em] text-[#20232A] dark:text-[#F6F3EC] transition-colors truncate uppercase`}
        >
          AURELIS
        </span>
        {showSubtitle && subtitle && (
          <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#858A93] dark:text-[#777F8C] -mt-0.5 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

interface AurelisSplashLoaderProps {
  message?: string;
  submessage?: string;
  size?: number;
}

export const AurelisSplashLoader: React.FC<AurelisSplashLoaderProps> = ({
  message,
  submessage,
  size = 88,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#B88A43]/20 via-[#3B82F6]/15 to-[#E6C27A]/20 blur-xl opacity-80"
        />
        <AurelisLogo
          variant="full"
          size={size}
          priority
          className="relative shadow-2xl border-[#E6C27A]/40"
        />
      </div>

      {message && (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-[#20232A] dark:text-[#F6F3EC]">
            {message}
          </p>
          {submessage && (
            <p className="text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
