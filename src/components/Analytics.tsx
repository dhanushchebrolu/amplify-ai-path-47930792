import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { env } from "@/config/env";

const GA_ID = env.GA_MEASUREMENT_ID;
const ENABLED =
  typeof window !== "undefined" &&
  env.PROD &&
  !!GA_ID &&
  /^G-[A-Z0-9]+$/i.test(GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaLoaded?: boolean;
  }
}

function loadGtagOnce() {
  if (!ENABLED || window.__gaLoaded) return;
  window.__gaLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // We track page views manually on route change, so disable auto send_page_view.
  window.gtag("config", GA_ID!, { send_page_view: false });
}

export function Analytics() {
  const router = useRouter();

  useEffect(() => {
    if (!ENABLED) return;
    loadGtagOnce();

    const send = () => {
      const path = window.location.pathname + window.location.search;
      window.gtag?.("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    // Initial page view
    send();

    const unsub = router.subscribe("onResolved", () => {
      send();
    });
    return () => {
      unsub();
    };
  }, [router]);

  return null;
}
