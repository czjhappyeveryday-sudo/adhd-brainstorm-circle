import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "./StarRating";
import { strugglesQuery } from "@/lib/queries";
import { addEncouragement, addSolution, addStruggle } from "@/lib/community.functions";
import { cn } from "@/lib/utils";
import { encouragementInput, errorMessage, solutionInput, struggleInput } from "@/lib/community";

export type EntryType = "struggle" | "solution" | "encouragement";

const TYPES: { value: EntryType; label: string; emoji: string }[] = [
  { value: "struggle", label: "困扰", emoji: "🌧️" },
  { value: "solution", label: "解决办法", emoji: "🌱" },
  { value: "encouragement", label: "鼓励", emoji: "🌈" },
];

export function AddEntryDialog({
  defaultType = "struggle",
  defaultStruggleId,
  trigger,
}: {
  defaultType?: EntryType;
  defaultStruggleId?: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EntryType>(defaultType);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [struggleId, setStruggleId] = useState(defaultStruggleId ?? "");
  const [priority, setPriority] = useState(3);
  const [author, setAuthor] = useState("");
  const qc = useQueryClient();

  const struggles = useQuery({ ...strugglesQuery, enabled: open && type === "solution" });

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setStruggleId(defaultStruggleId ?? "");
    }
  }, [open, defaultType, defaultStruggleId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (type === "struggle")
        return addStruggle({
          data: struggleInput.parse({ title, description: body, priority, author }),
        });
      if (type === "solution")
        return addSolution({
          data: solutionInput.parse({
            struggle_id: struggleId,
            title,
            content: body,
            priority,
            author,
          }),
        });
      return addEncouragement({
        data: encouragementInput.parse({ content: body, priority, author }),
      });
    },
    onSuccess: async () => {
      toast.success("已添加，谢谢你的分享 💛");
      await qc.invalidateQueries({
        queryKey: [type === "encouragement" ? "encouragements" : "struggles"],
      });
      setTitle("");
      setBody("");
      setPriority(3);
      setOpen(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">添加内容</DialogTitle>
          <DialogDescription>选择你想添加的类型，所有人都能看到。</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="类型">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={type === t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  "rounded-2xl border-2 px-2 py-3 text-sm font-medium transition-colors",
                  type === t.value
                    ? "border-primary bg-secondary text-secondary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                <span className="mb-1 block text-xl">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {type === "solution" && (
            <div className="space-y-2">
              <Label>对应哪个困扰？</Label>
              <Select value={struggleId} onValueChange={setStruggleId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={struggles.isLoading ? "加载中…" : "选择一个困扰"} />
                </SelectTrigger>
                <SelectContent>
                  {(struggles.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type !== "encouragement" && (
            <div className="space-y-2">
              <Label htmlFor="entry-title">{type === "struggle" ? "困扰是什么？" : "办法是什么？"}</Label>
              <Input
                id="entry-title"
                className="rounded-xl"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "struggle" ? "例如：早上总是起不来" : "例如：把闹钟放在房间另一头"}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="entry-body">
              {type === "struggle" ? "具体说说（可选）" : type === "solution" ? "详细做法（可选）" : "想说的话"}
            </Label>
            <Textarea
              id="entry-body"
              className="min-h-28 rounded-xl"
              value={body}
              maxLength={type === "encouragement" ? 1000 : 3000}
              onChange={(e) => setBody(e.target.value)}
              placeholder={type === "encouragement" ? "写给同样在努力的你…" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>优先级</Label>
            <StarRating value={priority} onChange={setPriority} size="md" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-author">昵称（可选）</Label>
            <Input
              id="entry-author"
              className="rounded-xl"
              value={author}
              maxLength={40}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="不填则显示为匿名"
            />
          </div>

          <Button type="submit" variant="warm" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "提交中…" : "添加"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

