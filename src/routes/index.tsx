import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Sprout } from "lucide-react";
import skyImage from "@/assets/sky-clouds.jpg";
import { Button } from "@/components/ui/button";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { StarRating } from "@/components/StarRating";
import { AuthorLine, EmptyState, LoadError, PageIntro } from "@/components/PageIntro";
import { strugglesQuery } from "@/lib/queries";
import { formatDate, sortByPriority } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ADHD 的困扰 · ADHD 小云朵" },
      { name: "description", content: "记录 ADHD 生活中的各种困扰，按 1–5 星标记优先级，一起找到解决办法。" },
      { property: "og:title", content: "ADHD 的困扰 · ADHD 小云朵" },
      { property: "og:description", content: "记录 ADHD 生活中的各种困扰，按 1–5 星标记优先级。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strugglesQuery),
  component: StrugglesPage,
  errorComponent: ({ error }) => <LoadError error={error} />,
  notFoundComponent: () => <EmptyState>找不到内容</EmptyState>,
});

function StrugglesPage() {
  const { data } = useSuspenseQuery(strugglesQuery);
  const struggles = sortByPriority(data);

  return (
    <>
      <section className="relative mb-10 overflow-hidden rounded-[2rem] shadow-soft">
        <img
          src={skyImage}
          alt="粉色云朵与小纸船漂在蓝色天空下"
          width={1600}
          height={640}
          className="h-48 w-full object-cover sm:h-64"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-3xl text-foreground drop-shadow-sm sm:text-5xl">
            慢慢来，我们都在这里
          </p>
          <p className="mt-2 text-sm text-foreground/80 sm:text-base">
            写下困扰 · 分享办法 · 互相打气
          </p>
        </div>
      </section>

      <PageIntro
        emoji="🌧️"
        title="ADHD 的困扰"
        subtitle="把让你头疼的事情写下来，星星越多代表越想优先解决。"
        action={
          <AddEntryDialog
            defaultType="struggle"
            trigger={
              <Button variant="warm" size="lg">
                <Plus /> 添加困扰
              </Button>
            }
          />
        }
      />

      {struggles.length === 0 ? (
        <EmptyState>还没有人写下困扰，来做第一个吧。</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {struggles.map((s) => (
            <li key={s.id} className="card-float flex flex-col rounded-3xl bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center justify-between gap-2">
                <StarRating value={s.priority} />
                <AuthorLine author={s.author} date={formatDate(s.created_at)} />
              </div>
              <h2 className="text-xl text-card-foreground">{s.title}</h2>
              {s.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                <Link
                  to="/solutions"
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Sprout className="size-3.5" /> {s.solutions.length} 个解决办法
                </Link>
                <AddEntryDialog
                  defaultType="solution"
                  defaultStruggleId={s.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="rounded-full text-primary">
                      <Plus /> 提个办法
                    </Button>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
