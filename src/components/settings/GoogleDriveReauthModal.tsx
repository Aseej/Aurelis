import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToCloudConnection,
  connectGoogleDrive,
  isPreviouslyConnectedUser,
  wasReauthReminderShownThisSession,
  markReauthReminderShownThisSession,
  getPersistedDriveMetadata,
} from '../../services/googleDriveService';
import { cloudBackupManager } from '../../services/cloudBackupManager';
import { Cloud, ShieldCheck, RefreshCw, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const GoogleDriveReauthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Ref guard to prevent double-trigger during initial sync or StrictMode
  const evaluatedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToCloudConnection((info) => {
      // If already connected with valid token, keep modal closed
      if (info.state === 'connected' && info.hasValidToken) {
        setIsOpen(false);
        return;
      }

      // Check all 5 eligibility conditions:
      // 1. Previously connected Google Drive Backup
      // 2. Not explicitly disconnected by the student
      // 3. No currently valid access token is available
      // 4. Connection state requires user reauthorization
      // 5. Not already displayed or dismissed during current browser session
      if (info.state === 'reauth_required' && !info.hasValidToken) {
        const isEligibleUser = isPreviouslyConnectedUser();
        const alreadyPrompted = wasReauthReminderShownThisSession();

        if (isEligibleUser && !alreadyPrompted && !evaluatedRef.current) {
          evaluatedRef.current = true;
          // Mark immediately in sessionStorage before rendering to prevent any duplicate prompts
          markReauthReminderShownThisSession();

          const meta = getPersistedDriveMetadata();
          setConnectedEmail(info.email || meta?.email || null);
          setIsOpen(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClose = useCallback(() => {
    // Ensure session-scoped dismissal is recorded
    markReauthReminderShownThisSession();
    setIsOpen(false);
    setAuthError(null);
  }, []);

  // Listen for Escape key to close cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isAuthorizing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAuthorizing, handleClose]);

  const handleReauthorize = async () => {
    if (isAuthorizing) return;
    try {
      setIsAuthorizing(true);
      setAuthError(null);

      // Explicitly user-initiated OAuth flow
      await connectGoogleDrive();

      setAuthSuccess(true);
      // Trigger any pending automatic backup
      cloudBackupManager.triggerPendingBackup();

      // Close modal gracefully after brief confirmation feedback
      setTimeout(() => {
        handleClose();
        setAuthSuccess(false);
      }, 900);
    } catch (err: any) {
      console.warn('Reauthorization failed:', err);
      // Show user-friendly error inside modal without closing or re-prompting
      const msg = err?.message?.includes('popup-closed-by-user')
        ? 'Authorization was cancelled. You can reconnect anytime in Settings.'
        : err?.message || 'Failed to authenticate with Google Drive. Please try again.';
      setAuthError(msg);
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-reauth-title"
      aria-describedby="drive-reauth-description"
      onClick={(e) => {
        // Close on backdrop click if not authorizing
        if (e.target === e.currentTarget && !isAuthorizing) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
        {/* Subtle top ambient glow */}
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#E6C27A]/15 dark:bg-[#E6C27A]/20 blur-2xl rounded-full"
          aria-hidden="true"
        />

        {/* Close Icon Button */}
        <button
          onClick={handleClose}
          disabled={isAuthorizing}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Visual & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#E6C27A]/25 to-[#A97B32]/10 border border-[#E6C27A]/35 flex items-center justify-center shadow-xs">
            <Cloud className="h-7 w-7 text-[#A97B32] dark:text-[#E6C27A]" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-[#12151C] border border-[#E6C27A]/40 flex items-center justify-center">
              <RefreshCw className="h-2.5 w-2.5 text-[#A97B32] dark:text-[#E6C27A]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3
              id="drive-reauth-title"
              className="text-lg font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]"
            >
              Reconnect your Google Drive
            </h3>
            <p
              id="drive-reauth-description"
              className="text-xs text-[#686D77] dark:text-[#A7ABB5] leading-relaxed max-w-xs mx-auto"
            >
              Your previous Google Drive authorization may have expired. Reauthorize to continue
              backing up your learning data securely.
            </p>
          </div>
        </div>

        {/* Account indicator if known */}
        {connectedEmail && (
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-[11px] text-[#686D77] dark:text-[#A7ABB5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A97B32] dark:bg-[#E6C27A]" />
            <span className="font-mono truncate max-w-[240px]">{connectedEmail}</span>
          </div>
        )}

        {/* Reassuring Safety Guarantee Message */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Your local study data is safe.</span>
        </div>

        {/* Error Feedback if authorization fails */}
        {authError && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="leading-snug">{authError}</span>
          </div>
        )}

        {/* Success Feedback */}
        {authSuccess && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Google Drive reconnected successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-2.5 pt-1">
          {/* Primary: Reauthorize Google Drive */}
          <button
            onClick={handleReauthorize}
            disabled={isAuthorizing || authSuccess}
            className="btn-gold-primary rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isAuthorizing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Cloud className="h-3.5 w-3.5" />
                <span>Reauthorize Google Drive</span>
              </>
            )}
          </button>

          {/* Secondary: Cancel */}
          <button
            onClick={handleClose}
            disabled={isAuthorizing}
            className="btn-glass-secondary rounded-xl px-4 py-2.5 text-xs font-medium text-[#686D77] dark:text-[#A7ABB5] hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
