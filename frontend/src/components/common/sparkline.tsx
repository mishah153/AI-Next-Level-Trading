import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  positive?: boolean;
}

/** Lightweight inline SVG sparkline — deterministic, no client JS. */
export function Sparkline({
  data,
  className,
  width = 96,
  height = 32,
  positive,
}: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const up = positive ?? data[data.length - 1] >= data[0];
  const stroke = up ? "var(--color-profit)" : "var(--color-loss)";
  const id = `spark-${up ? "u" : "d"}-${data.length}-${Math.round(min)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points.join(" ")} ${width},${height}`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
