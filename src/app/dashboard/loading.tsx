import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="mx-auto grid max-w-7xl gap-5 p-5 lg:grid-cols-3"><Skeleton className="h-[520px] rounded-3xl lg:col-span-2" /><div className="space-y-5"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-56 rounded-3xl" /></div></div>; }
