const CANONICAL_ORIGIN = "https://flowsyncdata.com";
const REDIRECT_HOSTS = new Set(["www.flowsyncdata.com", "profitlens-delta.vercel.app"]);

export function canonicalRedirectUrl(requestUrl: string): string | null {
  let url: URL;

  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (!REDIRECT_HOSTS.has(host)) {
    return null;
  }

  return `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
}
