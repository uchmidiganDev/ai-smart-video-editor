import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative rounded-lg px-3.5 py-2 text-sm font-medium text-white/55 transition-colors",
        "hover:text-white/85",
        "data-[state=active]:text-white data-[state=active]:bg-white/[0.08] data-[state=active]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn("outline-none focus-visible:outline-none", className)}
      {...props}
    />
  );
}
