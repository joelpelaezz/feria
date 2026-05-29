const QR_PROVIDER = "https://api.qrserver.com/v1/create-qr-code/";

export function getQrImageUrl(data: string, size = 256) {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    margin: "0",
    format: "svg",
    data,
  });

  return `${QR_PROVIDER}?${params.toString()}`;
}
