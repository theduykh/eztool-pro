import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. Use these instead of `next/link` and
 * `next/navigation` throughout the app so the active locale prefix is
 * added/stripped automatically:
 *   - `Link` prepends the current locale to `href`.
 *   - `usePathname()` returns the path WITHOUT the locale prefix, so existing
 *     `pathname === tool.path` comparisons keep working.
 *   - `useRouter().replace(pathname, { locale })` switches language in place.
 */
export const { Link, usePathname, useRouter, redirect, getPathname } =
    createNavigation(routing);
