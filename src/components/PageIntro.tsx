import type { ReactNode } from "react";

export function PageIntro({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 text-4xl" aria-hidden>
          {emoji}
        </div>
        <h1 className="text-4xl text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-card/60 p-10 text-center text-muted-foreground">
      {children}
    </div>
  );
}

export function LoadError({ error }: { error: unknown }) {
  return (
    <div role="alert" className="rounded-3xl bg-accent p-6 text-accent-foreground">
      加载失败：{error instanceof Error ? error.message : String(error)}
    </div>
  );
}

export function AuthorLine({ author, date }: { author: string; date: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      {author || "匿名"} · {date}
    </span>
  );
}
