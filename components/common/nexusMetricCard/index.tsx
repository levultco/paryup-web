import { cn } from "@/lib/utils";

type NexusMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "green" | "amber" | "red";
  className?: string;
};

const toneClasses: Record<NonNullable<NexusMetricCardProps["tone"]>, string> = {
  neutral: "from-white/[0.075] to-white/[0.025] text-white",
  green: "from-emerald-300/[0.16] to-white/[0.025] text-emerald-100",
  amber: "from-amber-300/[0.16] to-white/[0.025] text-amber-100",
  red: "from-rose-400/[0.16] to-white/[0.025] text-rose-100",
};

export const NexusMetricCard = ({
  label,
  value,
  detail,
  tone = "neutral",
  className,
}: NexusMetricCardProps) => {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-white/10 bg-gradient-to-br p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        toneClasses[tone],
        className,
      )}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/42">
        {label}
      </p>
      <p className="mt-3 font-mono text-3xl font-semibold leading-none tracking-[-0.06em] md:text-4xl">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm leading-snug text-white/48">{detail}</p> : null}
    </div>
  );
};

export default NexusMetricCard;
