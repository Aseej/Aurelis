import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AurelisLogo } from './AurelisLogo';
import { useI18n } from '../../i18n';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  showInstalledBadge?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'secondary',
  className = '',
  showInstalledBadge = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useI18n();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (!showInstalledBadge) return null;
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{t('pwa.installed', 'Installed as App')}</span>
      </div>
    );
  }

  const buttonClass =
    variant === 'primary'
      ? 'btn-gold-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs'
      : 'btn-glass-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium';

  if (isInstallable) {
    return (
      <button type="button" onClick={install} className={`${buttonClass} ${className}`}>
        <Download className="h-3.5 w-3.5" />
        <span>{t('pwa.installApp', 'Install AURELIS App')}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`${buttonClass} ${className}`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>{t('pwa.installIOS', 'Add to Home Screen')}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl glass-premium p-6 shadow-2xl border border-white/15 space-y-4 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AurelisLogo variant="full" size={44} />
                  <div>
                    <h3 className="font-serif text-sm font-semibold tracking-wider text-[#20232A] dark:text-[#F6F3EC]">
                      AURELIS
                    </h3>
                    <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      {t('pwa.iosTitle', 'Install on iPhone or iPad')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ol className="space-y-2 text-xs text-[#686D77] dark:text-[#A7ABB5] list-decimal list-inside leading-relaxed">
                <li>{t('pwa.iosStep1', 'Tap the Share button in the Safari toolbar.')}</li>
                <li>{t('pwa.iosStep2', 'Scroll down and tap "Add to Home Screen".')}</li>
                <li>{t('pwa.iosStep3', 'Tap "Add" for full-screen standalone launch.')}</li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full btn-gold-primary rounded-xl py-2.5 text-xs font-semibold"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
