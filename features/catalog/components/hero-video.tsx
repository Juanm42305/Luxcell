"use client";

import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

type HeroVideoProps = { src: string; poster: string };

/**
 * Video de fondo silencioso en bucle. La imagen fija queda debajo: se ve mientras carga y es lo
 * único que ve quien pide reducir el movimiento. El botón de pausa cumple WCAG 2.2.2.
 */
export function HeroVideo({ src, poster }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      setIsPaused(false);
    } else {
      element.pause();
      setIsPaused(true);
    }
  }

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <video
        ref={video}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
      />
      {/* Velo para que el texto conserve contraste sobre cualquier fotograma. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night" />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPaused ? "Reproducir video de fondo" : "Pausar video de fondo"}
        className="absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full border border-white/30 bg-night/60 text-white backdrop-blur transition-colors hover:border-brand hover:text-brand motion-reduce:hidden"
      >
        {isPaused ? (
          <Play aria-hidden className="size-4" />
        ) : (
          <Pause aria-hidden className="size-4" />
        )}
      </button>
    </>
  );
}
