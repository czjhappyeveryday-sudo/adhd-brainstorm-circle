import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { StarRating } from "@/components/StarRating";
import { AuthorLine, EmptyState, LoadError, PageIntro } from "@/components/PageIntro";
import { strugglesQuery } from "@/lib/queries";
import { formatDate, sortByPriority } from "@/lib/community";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "解决办法 · ADHD 小云朵" },
      { name: "description", content: "针对每一个 ADHD 困扰，大家分享的实用解决办法，按星级排序。" },
      { property: "og:title", content: "解决办法 · ADHD 小云朵" },
      { property: "og:description", content: "针对每一个 ADHD 困扰，大家分享的实用解决办法。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strugglesQuery),
  component: SolutionsPage,
  errorComponent: ({ error }) => <LoadError error={error} />,
  notFoundComponent: () => <EmptyState>找不到内容</EmptyState>,
});

function SolutionsPage() {
  const { data } = useSuspenseQuery(strugglesQuery);
  const struggles = sortByPriority(data);

  return (
    <>
      <PageIntro
        emoji="🌱"
        title="解决办法"
        subtitle="每个困扰下面，是大家试过有用的小办法。"
        action={
          <AddEntryDialog
            defaultType="solution"
            trigger={
              <Button variant="warm" size="lg">
                <Plus /> 添加解决办法
              </Button>
            }
          />
        }
      />

      {struggles.length === 0 ? (
        <EmptyState>先去「困扰」页写下一个困扰，再来这里提办法吧。</EmptyState>
      ) : (
        <div className="space-y-8">
          {struggles.map((s) => {
            const solutions = sortByPriority(s.solutions);
            return (
              <section key={s.id} className="rounded-[2rem] bg-card/70 p-5 shadow-card sm:p-7">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wider text-accent-foreground">
                      困扰
                    </p>
                    <h2 className="text-2xl text-card-foreground">{s.title}</h2>
                  </div>
                  <AddEntryDialog
                    defaultType="solution"
                    defaultStruggleId={s.id}
                    trigger={
                      <Button variant="soft" size="sm">
                        <Plus /> 提个办法
                      </Button>
                    }
                  />
                </div>

                {solutions.length === 0 ? (
                  <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    还没有办法，你有好主意吗？
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {solutions.map((sol) => (
                      <li
                        key={sol.id}
                        className="rounded-2xl border-l-4 border-sky bg-secondary/60 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-lg text-secondary-foreground">{sol.title}</h3>
                          <StarRating value={sol.priority} />
                        </div>
                        {sol.content && (
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {sol.content}
                          </p>
                        )}
                        <div className="mt-2">
                          <AuthorLine author={sol.author} date={formatDate(sol.created_at)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
