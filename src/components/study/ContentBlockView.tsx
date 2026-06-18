import { CheckCircle } from "lucide-react";
import type { ContentBlockViewProps } from "@/types/study";

export function ContentBlockView({ type, text }: ContentBlockViewProps) {
  if (type === "heading") {
    return <h2 className="pt-4 text-xl font-black leading-snug text-slate-900 first:pt-0">{text}</h2>;
  }

  if (type === "subheading") {
    return <h3 className="pt-2 text-base font-bold leading-snug text-primary">{text}</h3>;
  }

  if (type === "list") {
    return (
      <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>{text}</span>
      </div>
    );
  }

  return <p className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg">{text}</p>;
}
