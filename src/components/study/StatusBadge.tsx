import { Badge } from "@/components/ui/badge";
import type { TopicStatus } from "@/types/study";

export function StatusBadge({ status }: { status: TopicStatus }) {
  switch (status) {
    case "mastered":
      return <Badge className="rounded-full border-none bg-emerald-500 px-4 py-1.5 font-bold text-white hover:bg-emerald-600">Освоено</Badge>;
    case "studying":
      return <Badge className="rounded-full border-none bg-amber-500 px-4 py-1.5 font-bold text-white hover:bg-amber-600">Изучается</Badge>;
    default:
      return <Badge className="rounded-full border-none bg-slate-200 px-4 py-1.5 font-bold text-slate-500">Не изучено</Badge>;
  }
}
