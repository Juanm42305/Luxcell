import { useId } from "react";
import type { ProductArtKind, ProductArtView } from "@/types/catalog";

type ProductArtProps = {
  kind: ProductArtKind;
  view?: ProductArtView;
  tone: string;
  alt?: string;
  className?: string;
};

/** Ilustración vectorial provisional: ocupa el lugar de las fotografías reales del negocio. */
export function ProductArt({ kind, view = "front", tone, alt, className }: ProductArtProps) {
  const shadeId = useId();

  return (
    <svg
      viewBox="0 0 240 300"
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    >
      <defs>
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="284" rx="72" ry="7" fill="#000" opacity="0.1" />
      <ArtShape kind={kind} view={view} tone={tone} shade={`url(#${shadeId})`} />
    </svg>
  );
}

function ArtShape({
  kind,
  view,
  tone,
  shade,
}: {
  kind: ProductArtKind;
  view: ProductArtView;
  tone: string;
  shade: string;
}) {
  if (kind === "earbuds") {
    return (
      <g>
        <rect x="62" y="120" width="116" height="130" rx="44" fill={tone} />
        <rect x="62" y="120" width="116" height="130" rx="44" fill={shade} />
        <path d="M63 168h114" stroke="#000" strokeOpacity="0.16" strokeWidth="1.5" />
        <circle cx="120" cy="190" r="3.5" fill="#000" opacity="0.3" />
        <g fill={tone} stroke="#000" strokeOpacity="0.1">
          <path d="M84 60c-14 0-24 10-24 23s10 22 22 22v30c0 6 4 10 9 10s9-4 9-10V78c0-10-7-18-16-18z" />
          <path d="M156 60c14 0 24 10 24 23s-10 22-22 22v30c0 6-4 10-9 10s-9-4-9-10V78c0-10 7-18 16-18z" />
        </g>
      </g>
    );
  }

  if (kind === "charger") {
    return (
      <g>
        <rect x="104" y="40" width="9" height="34" rx="2" fill="#a9a9a4" />
        <rect x="127" y="40" width="9" height="34" rx="2" fill="#a9a9a4" />
        <rect x="66" y="70" width="108" height="124" rx="24" fill={tone} />
        <rect x="66" y="70" width="108" height="124" rx="24" fill={shade} />
        <rect x="103" y="166" width="34" height="9" rx="4.5" fill="#000" opacity="0.5" />
        <path
          d="M120 194v34c0 26 44 12 44 40"
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M120 194v34c0 26 44 12 44 40"
          fill="none"
          stroke="#000"
          strokeOpacity="0.1"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (kind === "device") {
    return (
      <g>
        <rect x="44" y="92" width="152" height="152" rx="36" fill={tone} />
        <rect x="44" y="92" width="152" height="152" rx="36" fill={shade} />
        <circle
          cx="120"
          cy="168"
          r="42"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <circle cx="120" cy="168" r="13" fill="#fff" fillOpacity="0.35" />
      </g>
    );
  }

  const isCase = kind === "case";
  const showBack = isCase || view === "back";

  return (
    <g>
      <rect x="58" y="16" width="124" height="262" rx="26" fill={tone} />
      {!showBack && <rect x="64" y="22" width="112" height="250" rx="20" fill="#0d0e11" />}
      {!showBack && (
        <>
          <rect x="64" y="22" width="112" height="250" rx="20" fill={shade} opacity="0.55" />
          <rect x="102" y="31" width="36" height="9" rx="4.5" fill="#000" />
        </>
      )}
      {showBack && (
        <>
          <rect x="58" y="16" width="124" height="262" rx="26" fill={shade} />
          <rect
            x="70"
            y="29"
            width="60"
            height="62"
            rx="16"
            fill={isCase ? "#f7f7f4" : "#000"}
            fillOpacity={isCase ? 1 : 0.18}
          />
          {!isCase && (
            <>
              <circle cx="87" cy="47" r="10" fill="#111" />
              <circle cx="87" cy="73" r="10" fill="#111" />
              <circle cx="113" cy="60" r="10" fill="#111" />
            </>
          )}
        </>
      )}
    </g>
  );
}
