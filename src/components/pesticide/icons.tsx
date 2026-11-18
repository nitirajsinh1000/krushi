const ICON_BASE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Search({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Camera({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function RotateCcw({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE}>
      <path d="M3 12a9 9 0 1 0 2.64-6.36" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function Sprout({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE}>
      <path d="M7 20h10" />
      <path d="M10 20c0-4.4-2-6-5-6a5 5 0 0 1 5-5v1" />
      <path d="M14 20c0-6 3-9 7-9a6 6 0 0 1-6 6h-1" />
    </svg>
  );
}

export function CropRows({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M4 20c4-2 6-6 6-16" />
      <path d="M10 20c3-3 4-8 4-16" />
      <path d="M16 20c2-3 3-7 3-12" />
      <path d="M5 15h14" />
    </svg>
  );
}

export function Flask({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

export function WeedLeaf({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M12 21V9" />
      <path d="M12 14c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
      <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 8" />
    </svg>
  );
}

export function Ruler({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="m4 16 12-12 4 4L8 20H4v-4Z" />
      <path d="m13 7 4 4" />
      <path d="m10 10 2 2" />
      <path d="m7 13 2 2" />
    </svg>
  );
}

export function FertilizerBag({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M8 4h8l-1 4c3 2 4 5 4 9 0 3-2 4-7 4s-7-1-7-4c0-4 1-7 4-9L8 4Z" />
      <path d="M9 8h6" />
      <path d="M12 12v5" />
      <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}

export function PlantSpacing({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M7 19v-7" />
      <path d="M17 19v-7" />
      <path d="M7 14c-3 0-4-2-4-5 3 0 4 2 4 5Z" />
      <path d="M17 14c3 0 4-2 4-5-3 0-4 2-4 5Z" />
      <path d="M3 21h18" />
      <path d="M9 7h6" />
      <path d="m11 5-2 2 2 2" />
      <path d="m13 5 2 2-2 2" />
    </svg>
  );
}

export function YouTube({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#FF0000" d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81z" />
      <path fill="#FFFFFF" d="M9.55 15.5V8.5l6.27 3.5-6.27 3.5z" />
    </svg>
  );
}

export function MoaCodes({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M12 3c3.5 1.8 6.5 2.2 9 2v6c0 5-3.6 8.6-9 10-5.4-1.4-9-5-9-10V5c2.5-.2 5.5-.6 9-2Z" />
      <path d="m9 12 1.7-3.4 2.6 5.2 1.7-3.4" />
    </svg>
  );
}

export function DawaBook({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON_BASE} strokeWidth={2.6}>
      <path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z" />
      <path d="M4 17a3 3 0 0 1 3-3h11" />
      <path d="M12 9v4" />
      <path d="M10 11h4" />
    </svg>
  );
}
