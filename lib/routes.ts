export const AUTH_ROUTES = ["/login", "/register", "/forgot-password"] as const;

export const APP_ROUTE_PREFIXES = ["/properties", "/generations", "/settings"] as const;

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route);
}

export function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}