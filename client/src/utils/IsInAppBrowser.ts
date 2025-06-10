// utils/isInAppBrowser.ts
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || (window as any).vendor || (window as any).opera;

  // Check for common in-app browsers
  return (
    /FBAN|FBAV|Instagram|Line|LinkedInApp|WeChat|MicroMessenger|Twitter|Snapchat|TikTok|MiuiBrowser/i.test(ua) ||
    (ua.includes("Mobile") && (ua.includes("wv") || ua.includes("Android")))
  );
}
