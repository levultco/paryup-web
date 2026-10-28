"use client";

import { useId, useMemo } from "react";
import QRCode from "qrcode";

/** QR con módulos redondeados y degradado dorado, como el de la entrada de la app. */
export function QrCode({
  value,
  size = 180,
  label,
}: {
  value: string;
  size?: number;
  label: string;
}) {
  const gradient = useId();
  const cells = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    const count = qr.modules.size;
    const dark: [number, number][] = [];
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (qr.modules.get(x, y)) dark.push([x, y]);
      }
    }
    return { count, dark };
  }, [value]);

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${cells.count} ${cells.count}`}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D4AF37" />
          <stop offset="0.5" stopColor="#8B6914" />
          <stop offset="1" stopColor="#4A3C1F" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradient})`}>
        {cells.dark.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="1.02"
            height="1.02"
            rx="0.32"
          />
        ))}
      </g>
    </svg>
  );
}
