export function authReturnPath(value: unknown) {
  if (typeof value !== "string" || value.length > 2000 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/student";
  const url = new URL(value, "https://return.invalid");
  if (url.origin !== "https://return.invalid" || /^\/(?:api|login|signup|forgot-password|reset-password|admin)(?:\/|$)/.test(url.pathname)) return "/student";
  return url.pathname + url.search + url.hash;
}
