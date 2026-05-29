export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004";
}

export function getMerchantProfileUrl(slug: string) {
  return `${getBaseUrl()}/comerciantes/${slug}`;
}
