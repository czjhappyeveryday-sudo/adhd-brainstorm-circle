import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { StarRating } from "@/components/StarRating";
import { AuthorLine, EmptyState, LoadError, PageIntro } from "@/components/PageIntro";
import { encouragementsQuery } from "@/lib/queries";
import { formatDate, sortByPriority } from "@/lib/community";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/encouragement")({
  head: () => ({
    meta: [
      { title: "互相鼓励 · ADHD 小云朵" },
      { name: "description", content: "ADHD 伙伴们写给彼此的温暖话语，一起慢慢变好。" },
      { property: "og:title", content: "互相鼓励 · ADHD 小云朵" },
      { property: "og:description", content: "ADHD 伙伴们写给彼此的温暖话语。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(encouragementsQuery),
  component: EncouragementPage,
  errorComponent: ({ error }) => <LoadError error={error} />,
  notFoundComponent: () => <EmptyState>找不到内容</EmptyState>,
});

const NOTE_STYLES = ["bg-secondary", "bg-accent", "bg-card", "bg-peach"];
const TILTS = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-[0.5deg]"];

function EncouragementPage() {
  const { data } = useSuspenseQuery(encouragementsQuery);
  const notes = sortByPriority(data);

  return (
    <>
      <PageIntro
        emoji="🌈"
        title="互相鼓励"
        subtitle="给同样在努力的伙伴留一句话，也许正好有人需要。"
        action={
          <AddEntryDialog
            defaultType="encouragement"
            trigger={
              <Button variant="warm" size="lg">
                <Heart /> 写一句鼓励
              </Button>
            }
          />
        }
      />

      {notes.length === 0 ? (
        <EmptyState>还没有鼓励，留下第一句温暖的话吧。</EmptyState>
      ) : (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {notes.map((n, i) => (
            <li
              key={n.id}
              className={cn(
                "card-float mb-4 break-inside-avoid rounded-3xl p-6 shadow-card",
                NOTE_STYLES[i % NOTE_STYLES.length],
                TILTS[i % TILTS.length],
              )}
            >
              <StarRating value={n.priority} />
              <p className="mt-3 whitespace-pre-wrap font-display text-xl leading-relaxed text-foreground">
                “{n.content}”
              </p>
              <div className="mt-4 text-right">
                <AuthorLine author={n.author} date={formatDate(n.created_at)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
