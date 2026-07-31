import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";

export function Slider({ className, ...props }: SliderPrimitive.SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-5 w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/[0.08]">
        <SliderPrimitive.Range className="absolute h-full bg-brand-gradient" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-accent-violet bg-white shadow-glow-violet transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/60" />
    </SliderPrimitive.Root>
  );
}
