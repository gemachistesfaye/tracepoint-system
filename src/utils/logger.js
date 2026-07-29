import { analytics } from "../firebase/config";
import { logEvent } from "firebase/analytics";

const isDev = process.env.NODE_ENV === "development";

const prefix = (level) => `[TracePoint:${level}]`;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(prefix("LOG"), ...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(prefix("WARN"), ...args);
  },
  error: (message, ...args) => {
    if (isDev) console.error(prefix("ERROR"), message, ...args);
    if (analytics) {
      logEvent(analytics, "app_error", {
        message: typeof message === "string" ? message : message?.message || "unknown",
      });
    }
  },
};

export const trackEvent = (eventName, params = {}) => {
  if (isDev) {
    console.log(prefix("EVENT"), eventName, params);
  }
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export const trackItemReported = (category, location) =>
  trackEvent("item_reported", { category, location });

export const trackItemClaimed = (itemType) =>
  trackEvent("item_claimed", { item_type: itemType });

export const trackMatchFound = (score) =>
  trackEvent("match_found", { score });

export const trackSearchPerformed = (queryLength, resultCount) =>
  trackEvent("search_performed", { query_length: queryLength, result_count: resultCount });

// Capture unhandled promise rejections globally
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection:", event.reason);
  });
}
