"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CreditCard, GraduationCap, LayoutDashboard, PieChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const items = [
    {
      href: "/",
      active: pathname === "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Главная",
    },
    {
      href: "/stats",
      active: pathname === "/stats",
      icon: <PieChart className="w-5 h-5" />,
      label: "Статистика",
    },
    {
      href: "/topics",
      active: pathname.startsWith("/topics") || pathname.startsWith("/study"),
      icon: <BookOpen className="w-5 h-5" />,
      label: "Темы",
    },
    {
      href: "/flashcards",
      active: pathname === "/flashcards",
      icon: <CreditCard className="w-5 h-5" />,
      label: "Карточки",
    },
    {
      href: "/exam",
      active: pathname === "/exam",
      icon: <Sparkles className="w-5 h-5" />,
      label: "Экзамен",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <BrandMark />
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          30 тем
        </span>
      </header>

      <aside className="sticky top-0 z-20 hidden h-screen w-72 shrink-0 flex-col space-y-8 border-r bg-white p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:flex">
        <BrandMark />
        
        <nav className="flex-1 space-y-2">
          {items.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>AI Assistant</span>
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-slate-500">
            Проверяй пересказ темы и сразу находи пробелы перед экзаменом.
          </p>
        </div>

        <div className="flex items-center justify-between border-t px-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>v1.0.0</span>
          <span>Ready</span>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        {items.map((item) => (
          <MobileNavItem key={item.href} {...item} />
        ))}
      </nav>
    </>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-none tracking-tight">Marketing</span>
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam Prep</span>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
      )}
    >
      <span className={cn(
        "transition-colors",
        active ? "text-white" : "text-slate-400 group-hover:text-primary"
      )}>
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        />
      )}
    </Link>
  );
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold transition-colors",
        active ? "text-primary" : "text-slate-500"
      )}
    >
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", active && "bg-primary/10")}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
