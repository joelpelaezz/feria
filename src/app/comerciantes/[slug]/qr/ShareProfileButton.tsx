"use client";

export function ShareProfileButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  async function handleShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;

    try {
      await navigator.share({ title, url });
    } catch {
      // usuario canceló o share no disponible
    }
  }

  return (
    <button className="btn-primary" onClick={handleShare}>
      Compartir perfil
    </button>
  );
}
