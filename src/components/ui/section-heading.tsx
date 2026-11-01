import { cn } from "@/lib/utils";
import { SplitText, Reveal } from "./motion";

/** Eyebrow index + big headline with light-weight emphasis. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  italic,
  description,
  className,
  dark,
  align = "left",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  className?: string;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <Reveal>
        <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center", dark ? "text-white/50" : "text-muted")}>
          {index && <span className={dark ? "text-white" : "text-ink"}>{index}</span>}
          <span className="h-px w-8 bg-current opacity-40" />
          {eyebrow}
        </p>
      </Reveal>
      <h2 className={cn("display mt-5 text-[42px] sm:text-6xl lg:text-[84px]", dark && "text-white")}>
        <SplitText text={title} />
        {italic && (
          <>
            {" "}
            <SplitText text={italic} wordClassName="em-light" delay={0.15} />
          </>
        )}
      </h2>
      {description && (
        <Reveal delay={0.2}>
          <p
            className={cn(
              "mt-6 max-w-xl text-[16px] leading-relaxed md:text-lg",
              align === "center" && "mx-auto",
              dark ? "text-white/60" : "text-muted"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
