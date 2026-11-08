import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, MessageSquareHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { AuthorLine, EmptyState, LoadError, PageIntro } from "@/components/PageIntro";
import { papersQuery } from "@/lib/queries";
import { addPaper, addReflection } from "@/lib/community.functions";
import { errorMessage, formatDate, paperInput, reflectionInput, sortByPriority } from "@/lib/community";

export const Route = createFileRoute("/papers")({
  head: () => ({
    meta: [
      { title: "论文与感悟 · ADHD 小云朵" },
      { name: "description", content: "收集与 ADHD 相关的学术论文，并写下自己的阅读感悟。" },
      { property: "og:title", content: "论文与感悟 · ADHD 小云朵" },
      { property: "og:description", content: "收集与 ADHD 相关的学术论文，并写下阅读感悟。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(papersQuery),
  component: PapersPage,
  errorComponent: ({ error }) => <LoadError error={error} />,
  notFoundComponent: () => <EmptyState>找不到内容</EmptyState>,
});

function PapersPage() {
  const { data } = useSuspenseQuery(papersQuery);
  const papers = sortByPriority(data);

  return (
    <>
      <PageIntro
        emoji="📚"
        title="论文与感悟"
        subtitle="放一篇读过的 ADHD 相关论文，再写下它带给你的想法。"
        action={<AddPaperDialog />}
      />

      {papers.length === 0 ? (
        <EmptyState>还没有论文，添加第一篇吧。</EmptyState>
      ) : (
        <div className="space-y-6">
          {papers.map((p) => (
            <article key={p.id} className="rounded-[2rem] bg-card p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StarRating value={p.priority} />
                <AuthorLine author={p.added_by} date={formatDate(p.created_at)} />
              </div>
              <h2 className="mt-3 text-2xl leading-snug text-card-foreground">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {[p.authors, p.year].filter(Boolean).join(" · ")}
              </p>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 break-all text-sm text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" /> 阅读原文
                </a>
              )}
              {p.summary && (
                <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-muted p-4 text-sm leading-relaxed text-foreground/85">
                  {p.summary}
                </p>
              )}

              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg text-foreground">
                  <MessageSquareHeart className="size-5 text-blush" /> 我的感悟
                  <span className="text-sm text-muted-foreground">({p.paper_reflections.length})</span>
                </h3>
                <ul className="space-y-3">
                  {sortByPriority(p.paper_reflections).map((r) => (
                    <li key={r.id} className="rounded-2xl bg-accent/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <StarRating value={r.priority} />
                        <AuthorLine author={r.author} date={formatDate(r.created_at)} />
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {r.content}
                      </p>
                    </li>
                  ))}
                </ul>
                <ReflectionForm paperId={p.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function ReflectionForm({ paperId }: { paperId: string }) {
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState(3);
  const [author, setAuthor] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      addReflection({ data: reflectionInput.parse({ paper_id: paperId, content, priority, author }) }),
    onSuccess: async () => {
      toast.success("感悟已保存 ✨");
      setContent("");
      setPriority(3);
      await qc.invalidateQueries({ queryKey: ["papers"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form
      className="mt-4 space-y-3 rounded-2xl border-2 border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Label htmlFor={`reflection-${paperId}`}>写下你的感悟</Label>
      <Textarea
        id={`reflection-${paperId}`}
        className="min-h-24 rounded-xl"
        value={content}
        maxLength={3000}
        onChange={(e) => setContent(e.target.value)}
        placeholder="这篇论文让我想到……"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StarRating value={priority} onChange={setPriority} />
        <div className="flex flex-1 items-center justify-end gap-2">
          <Input
            aria-label="昵称"
            className="max-w-40 rounded-full"
            value={author}
            maxLength={40}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="昵称（可选）"
          />
          <Button type="submit" variant="warm" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中…" : "保存感悟"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function AddPaperDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState(3);
  const [addedBy, setAddedBy] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      addPaper({
        data: paperInput.parse({
          title,
          authors,
          year: year.trim() ? Number(year) : null,
          url,
          summary,
          priority,
          added_by: addedBy,
        }),
      }),
    onSuccess: async () => {
      toast.success("论文已添加 📚");
      await qc.invalidateQueries({ queryKey: ["papers"] });
      setTitle("");
      setAuthors("");
      setYear("");
      setUrl("");
      setSummary("");
      setPriority(3);
      setOpen(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="warm" size="lg">
          <Plus /> 添加论文
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">添加一篇论文</DialogTitle>
          <DialogDescription>添加后可以在论文下方写感悟。</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="paper-title">论文标题</Label>
            <Input id="paper-title" className="rounded-xl" value={title} maxLength={300} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="paper-authors">作者</Label>
              <Input id="paper-authors" className="rounded-xl" value={authors} maxLength={300} onChange={(e) => setAuthors(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-year">年份</Label>
              <Input id="paper-year" className="rounded-xl" inputMode="numeric" value={year} maxLength={4} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paper-url">链接（可选）</Label>
            <Input id="paper-url" className="rounded-xl" value={url} maxLength={500} onChange={(e) => setUrl(e.target.value)} placeholder="https://doi.org/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paper-summary">简介 / 摘要（可选）</Label>
            <Textarea id="paper-summary" className="min-h-24 rounded-xl" value={summary} maxLength={3000} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>优先级</Label>
            <StarRating value={priority} onChange={setPriority} size="md" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paper-by">昵称（可选）</Label>
            <Input id="paper-by" className="rounded-xl" value={addedBy} maxLength={40} onChange={(e) => setAddedBy(e.target.value)} />
          </div>
          <Button type="submit" variant="warm" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "提交中…" : "添加论文"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
