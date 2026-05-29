"use client";

import { useMemo, useState } from "react";

export function ProductGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const selectedPhoto = photos[selectedIndex];

  const canNavigate = photos.length > 1;

  const selectedLabel = useMemo(
    () => `${selectedIndex + 1}/${photos.length}`,
    [photos.length, selectedIndex]
  );

  function goTo(index: number) {
    const nextIndex = (index + photos.length) % photos.length;
    setSelectedIndex(nextIndex);
  }

  function goPrev() {
    goTo(selectedIndex - 1);
  }

  function goNext() {
    goTo(selectedIndex + 1);
  }

  function handleTouchStart(clientX: number) {
    setTouchStartX(clientX);
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX === null) return;

    const diff = clientX - touchStartX;
    const threshold = 40;

    if (Math.abs(diff) >= threshold) {
      if (diff > 0) goPrev();
      else goNext();
    }

    setTouchStartX(null);
  }

  if (photos.length === 0) {
    return (
      <div
        className="aspect-square rounded-xl border bg-surface-container-highest flex items-center justify-center"
        style={{ borderColor: "rgba(63,102,83,0.1)" }}
      >
        <span className="text-4xl text-on-surface-variant/30">📷</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square overflow-hidden rounded-xl border bg-surface-container-highest"
        style={{ borderColor: "rgba(63,102,83,0.1)" }}
        onTouchStart={(e) => handleTouchStart(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
      >
        <button
          type="button"
          className="h-full w-full cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Ampliar imagen ${selectedIndex + 1} de ${title}`}
        >
          <img
            src={selectedPhoto}
            alt={`${title} — imagen ${selectedIndex + 1}`}
            className="h-full w-full object-cover"
          />
        </button>

        {canNavigate && (
          <span className="absolute right-3 top-3 badge-categoria">
            {selectedLabel}
          </span>
        )}

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-on-surface"
              style={{ borderColor: "rgba(63,102,83,0.12)" }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-on-surface"
              style={{ borderColor: "rgba(63,102,83,0.12)" }}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {canNavigate && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-surface-container-highest transition-transform"
                style={{
                  borderColor: isActive
                    ? "var(--color-primary)"
                    : "rgba(63,102,83,0.1)",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
                aria-label={`Ver miniatura ${index + 1} de ${title}`}
                aria-pressed={isActive}
              >
                <img
                  src={photo}
                  alt={`${title} miniatura ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => handleTouchStart(e.touches[0]?.clientX ?? 0)}
            onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-on-surface"
              aria-label="Cerrar galería"
            >
              ✕
            </button>

            <div className="overflow-hidden rounded-xl bg-black">
              <img
                src={selectedPhoto}
                alt={`${title} — imagen ampliada ${selectedIndex + 1}`}
                className="max-h-[85vh] w-full object-contain"
              />
            </div>

            {canNavigate && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-on-surface"
                  aria-label="Imagen anterior ampliada"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-on-surface"
                  aria-label="Imagen siguiente ampliada"
                >
                  ›
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white">
                  <span>{selectedLabel}</span>
                  <span>·</span>
                  <span>Deslizá o tocá las flechas</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
