/**
 * Stable font placeholders.
 *
 * The app now uses deterministic CSS font stacks from app/globals.css. That
 * avoids dev-time hydration mismatches on the root <html> class.
 */
const noop = { variable: "", className: "" };

export const display = noop;
export const body = noop;
export const script = noop;
