import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { sections, chapterMap } from "@/data/chapters";
import * as Icons from "lucide-react";
import { ChevronDown, Search, X } from "lucide-react";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      if (isMobile) document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (!searching) return sections;
    const q = query.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        chapterSlugs: s.chapterSlugs.filter((slug) => {
          const c = chapterMap[slug];
          return c && (c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
        }),
      }))
      .filter((s) => s.chapterSlugs.length > 0);
  }, [query, searching]);

  return (
    <>
      {open && <div onClick={onClose} aria-hidden="true" className="lg:hidden fixed inset-0 bg-black/40 z-40" />}
      <aside
        id="chapter-sidebar"
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Menu de capítulos"
        tabIndex={-1}
        className={`fixed lg:sticky lg:top-14 top-0 left-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh-3.5rem)] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 lg:hidden">
          <span className="font-bold text-unity-cyan-dark dark:text-unity-cyan">Menu</span>
          <button onClick={onClose} aria-label="Fechar menu" className="ml-auto p-1"><X size={18} /></button>
        </div>
        <div className="p-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar capítulo…"
              aria-label="Buscar capítulo"
              className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded border border-transparent focus:border-unity-cyan focus:outline-none"
            />
          </div>
        </div>
        <nav className="px-2 pb-8">
          {filtered.map((s) => {
            const Icon = (Icons as any)[s.icon] || Icons.BookOpen;
            const isCollapsed = searching ? false : collapsed[s.id];
            return (
              <div key={s.id} className="mb-1">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <Icon size={16} className="text-unity-cyan-dark dark:text-unity-cyan" />
                  <span className="flex-1 text-left">{s.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                {!isCollapsed && (
                  <ul className="ml-4 border-l border-slate-200 dark:border-slate-800">
                    {s.chapterSlugs.map((slug) => {
                      const c = chapterMap[slug];
                      if (!c) return null;
                      const path = `/c/${slug}`;
                      const active = location === path;
                      return (
                        <li key={slug}>
                          <Link
                            href={path}
                            onClick={onClose}
                            aria-current={active ? "page" : undefined}
                            className={`block pl-3 pr-2 py-1.5 text-sm border-l-2 -ml-px transition-colors ${
                              active
                                ? "border-unity-cyan text-unity-cyan-dark dark:text-unity-cyan font-semibold bg-unity-cyan/10"
                                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-unity-cyan-dark dark:hover:text-unity-cyan hover:border-unity-cyan/30"
                            }`}
                          >
                            {c.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
          {searching && filtered.length === 0 && (
            <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
              Nenhum capítulo encontrado.
            </p>
          )}
        </nav>
      </aside>
    </>
  );
}
