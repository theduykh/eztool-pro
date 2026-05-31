import { defaultLocale, locales } from "@/i18n/routing";

/**
 * Root entry for `/`. In a static export there is no middleware to negotiate
 * the locale, so this page ships a tiny client script that picks the best
 * match from `navigator.language` and redirects to the locale home. The
 * `<meta http-equiv="refresh">` is a no-JS fallback to the default locale.
 *
 * It renders a full document because the root layout is a pass-through (the
 * real `<html lang>` lives in `app/[locale]/layout.tsx`).
 */
export default function RootRedirectPage() {
    const supported = JSON.stringify(locales);
    const redirectScript = `(function(){try{var s=${supported};var l=(navigator.language||"${defaultLocale}").toLowerCase();var m=s.find(function(x){return l===x||l.indexOf(x+"-")===0;});location.replace("/"+(m||"${defaultLocale}"));}catch(e){location.replace("/${defaultLocale}");}})();`;

    return (
        <html lang={defaultLocale}>
            <head>
                <meta httpEquiv="refresh" content={`0; url=/${defaultLocale}`} />
                <link rel="canonical" href={`/${defaultLocale}`} />
                <title>eztool.pro</title>
            </head>
            <body>
                <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
            </body>
        </html>
    );
}
