"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fmb-pwa-install-dismissed";

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebkit = /WebKit/.test(ua);
  const isChromeIos = /CriOS/.test(ua);
  return isIos && isWebkit && !isChromeIos;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

/**
 * Shows a clear Install App control on Android/Chrome when the site is installable,
 * and Add-to-Home-Screen tips on iOS (which has no install prompt API).
 */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    // Belt-and-braces registration for mobile browsers
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* Serwist also registers; ignore duplicate/failed */
      });
    }

    if (isIosSafari()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Chrome often delays / hides the auto banner — show menu instructions after a short wait.
    const tipTimer = window.setTimeout(() => {
      setVisible(true);
    }, 5000);

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(tipTimer);
    };
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
    } catch {
      /* user cancelled or prompt failed */
    } finally {
      setInstalling(false);
    }
  }

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-sa-green/30 bg-white p-4 shadow-lg shadow-slate-900/10">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sa-green text-white">
          <Download className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sa-blue">Install Find My Biz</p>
          {iosHint ? (
            <p className="mt-1 text-sm text-slate-600">
              Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong> to install.
            </p>
          ) : deferred ? (
            <p className="mt-1 text-sm text-slate-600">
              Add the app to your home screen for faster access.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              In Chrome, open the menu (⋮) and tap <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>. Use Chrome — not Facebook/WhatsApp in-app
              browsers.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {deferred && (
              <Button
                size="sm"
                className="bg-sa-green text-white hover:bg-sa-green/90"
                disabled={installing}
                onClick={install}
              >
                {installing ? "Installing…" : "Install app"}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
