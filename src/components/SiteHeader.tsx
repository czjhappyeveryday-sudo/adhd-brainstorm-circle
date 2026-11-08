import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEntryDialog } from "./AddEntryDialog";

const NAV = [
  { to: "/", label: "困扰", emoji: "🌧️" },
  { to: "/solutions", label: "解决办法", emoji: "🌱" },
  { to: "/encouragement", label: "互相鼓励", emoji: "🌈" },
  { to: "/papers", label: "论文与感悟", emoji: "📚" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-auto flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-warm text-lg shadow-soft" aria-hidden>
            ☁️
          </span>
          <span className="font-display text-2xl text-foreground">ADHD 小云朵</span>
        </Link>

        <AddEntryDialog
          trigger={
            <Button variant="warm" size="sm" className="order-2 sm:order-3">
              <Plus /> 添加
            </Button>
          }
        />

        <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
            >
              <span className="mr-1" aria-hidden>
                {n.emoji}
              </span>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
