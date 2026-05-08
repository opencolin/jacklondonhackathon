import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  bg = "white",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: "white" | "tint" | "navy";
  id?: string;
}) {
  const bgClass =
    bg === "tint"
      ? "bg-ink-50 dark:bg-ink-800"
      : bg === "navy"
      ? "bg-navy-700 text-white"
      : "bg-white dark:bg-ink-900";
  return (
    <section id={id} className={cn("section", bgClass, className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
            invert ? "text-lime" : "text-ink-500 dark:text-ink-400",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "h-display text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl",
          invert ? "text-white" : "text-ink-900 dark:text-ink-50",
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn("mt-5 text-lg", invert ? "text-ink-100" : "text-ink-600 dark:text-ink-300")}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
